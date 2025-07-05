import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Route } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../enviornments/enviornment';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { getAuth } from 'firebase/auth';


import { 
  Auth, 
  RecaptchaVerifier, 
  PhoneAuthProvider, 
  signInWithCredential,
  signInWithPhoneNumber
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import { 
    Firestore, 
    doc, 
    docSnapshots, 
    DocumentSnapshot 
  } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})



export class CommonService {
    private auth: Auth;
     private recaptchaVerifier: RecaptchaVerifier | null = null;
    private firebaseService = inject(FirebaseService);
    confirmationResult: any;

    constructor(private http: HttpClient,private firestore: Firestore,    ) {
        const app = initializeApp(environment.firebaseConfig);
        this.auth = getAuth(app);
    }

    baseUrl = environment.apiUrl;

    getData(endPoint: string, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Content-Type': 'application/json'
        });
        return this.http.get(`${this.baseUrl}${endPoint}`, { headers, params });
    }

    getCSVData(endPoint: string, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Accept': 'text/csv, application/csv' // Tell server we want CSV
        });
        
        // Use responseType: 'text' to get the raw CSV string
        return this.http.get(`${this.baseUrl}${endPoint}`, { 
            headers, 
            params,
            responseType: 'text' // Critical for receiving CSV data
        });
    }

    postData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
        });
        if (localStorage.getItem('token')) {
            headers = new HttpHeaders({
                'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
                'Content-Type': 'application/json'
            });
        }
    
        // Return the HTTP request with headers, body and params
        return this.http.post(
            `${this.baseUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }

    putData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Content-Type': 'application/json'
        });
    
        // Return the HTTP request with headers, body and params
        return this.http.put(
            `${this.baseUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }

    // sendOTP(phoneNumber: string) {
    //     return this.firebaseService.sendPhoneVerificationCode(phoneNumber, 'recaptcha-container');
    // }
    
    // Send OTP to phone number
    // async sendOTP(phoneNumber: string) {
    //     try {
    //         // Use our enhanced FirebaseService for OTP
    //         // Note: We need a container ID for the recaptcha component
    //         // You might need to adjust this to match your UI components
    //         const confirmationResult = await this.firebaseService.sendPhoneVerificationCode(
    //             phoneNumber, 
    //             'recaptcha-container' // This should match an element ID in your HTML
    //         );
    //         return confirmationResult;
    //     } catch (error) {
    //         console.error('Error sending OTP:', error);
    //         throw error;
    //     }
    // }


    initRecaptcha(buttonId: string) {
        this.recaptchaVerifier = new RecaptchaVerifier(this.auth, buttonId, {
          size: 'invisible'
        });
      }
    
    // Send OTP to phone number
    sendOTP(phoneNumber: string): Promise<string> {
        if (!this.recaptchaVerifier) {
            return Promise.reject('Recaptcha verifier is not initialized');
        }
        
        return signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
            .then((confirmationResult) => {
            this.confirmationResult = confirmationResult;
            return 'OTP sent successfully';
            });
    }

    // Verify OTP
    verifyOTP(otp: string): Promise<any> {
        if (!this.confirmationResult) {
        return Promise.reject('No verification code was sent');
        }
        
        return this.confirmationResult.confirm(otp)
        .then((result: any) => {
            // User signed in successfully
            return result.user;
        });
    }

    // Upload document file 
    uploadFile(uploadData: File): Observable<any> {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
        });

        const formData = new FormData();
        formData.append('file', uploadData);
        formData.append('file_name', uploadData.name);
        console.log(formData);
        return this.http.post(
        `${this.baseUrl}/api/method/wefab.wefab.api.supplier.onboarding.geolocation.geolocation_exif.upload_file_preserve_exif`,
        formData,
        {   
            headers,
            reportProgress: true,
            observe: 'events',
        }
        );
    }

    // Upload document file with progress tracking - handles FormData directly
    uploadFileWithProgress(formData: FormData): Observable<any> {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
        });

        return this.http.post(
        `${this.baseUrl}/api/method/wefab.wefab.api.supplier.onboarding.geolocation.geolocation_exif.upload_file_preserve_exif`,
        formData,
        {   
            headers,
            reportProgress: true,
            observe: 'events',
        }
        );
    }

    getMachineAnalysis(machineId: string) {
        return this.http.get(`http://localhost:3000/analyzeMachineImage?file_id=${machineId}`)
    }

    getFacilityAnalysis(machineId: string, address: string) {
        return this.http.get(`http://localhost:3000/factoryGeoVerification?file_id=${machineId}&factory_address_string=${address}`)
    }

     // Firebase method - now compatible with Angular Fire 17.1.0
     commonFirebaseTrigger(doctType_name: string, doctypeId: string): Observable<DocumentSnapshot<any>> {
        const docRef = doc(this.firestore, `${doctType_name}/${doctypeId}`);
        return docSnapshots(docRef);
    }

    getWefabData(endPoint: string, params?: HttpParams) {
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Content-Type': 'application/json'
        });
        return this.http.get(`${environment.wefabApiUrl}${endPoint}`, { headers, params });
    }

    postWefabData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Content-Type': 'application/json'
        });
    
        // Return the HTTP request with headers, body and params
        return this.http.post(
            `${environment.wefabApiUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }

    putWefabData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Content-Type': 'application/json'
        });
    
        // Return the HTTP request with headers, body and params
        return this.http.put(
            `${environment.wefabApiUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }

    patchWefabData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Token 3f36743188b20d5:afcc7c21d6aeac0`,
            'Content-Type': 'application/json'
        });
    
        // Return the HTTP request with headers, body and params
        return this.http.patch(
            `${environment.wefabApiUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }
    
    completeWorkflowStep(data: {
        stepId: string;
        comments: string;
        fileUrls: string[];
    }): Observable<any> {
        // Transform the data to match the API format
        const apiPayload = {
            po_name: data.stepId,
            action_name: 'Approve',
            comments: data.comments,
            attached_files: data.fileUrls
        };

        // Replace with your actual API endpoint
        const endpoint = `${environment.apiUrl}/workflow/complete-step`;
        return this.http.post(endpoint, apiPayload);
    }
}
