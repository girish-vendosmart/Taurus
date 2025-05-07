import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Route } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../enviornments/enviornment';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';

@Injectable({
    providedIn: 'root'
})

export class CommonService {
    private firebaseService = inject(FirebaseService);

    constructor(private http: HttpClient) {}

    baseUrl = environment.apiUrl;

    postData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': 'Token c82020f17e1fd10:f34acaf7862dc9c',
            'Content-Type': 'application/json'
        });
    
        // Return the HTTP request with headers, body and params
        return this.http.post(
            `${this.baseUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }

    sendOTP(phoneNumber: string) {
        return this.firebaseService.sendPhoneVerificationCode(phoneNumber, 'recaptcha-container');
    }
    
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
}
