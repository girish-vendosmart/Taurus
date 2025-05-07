import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../enviornments/enviornment';

@Injectable({
    providedIn: 'root'
})

export class CommonService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }


    // Get data from the API
    getData(endPoint: string, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': 'Token c82020f17e1fd10:f34acaf7862dc9c'
        });

        return this.http.get(
            `${this.apiUrl}${endPoint}`, { params, headers }
        );
    }

    // Post data to the API
    postData(endPoint: string, body: any, params?: HttpParams) {
        // Create headers with Authorization token
        const headers = new HttpHeaders({
            'Authorization': 'Token c82020f17e1fd10:f34acaf7862dc9c',
            'Content-Type': 'application/json'
        });
    
        // Return the HTTP request with headers, body and params
        return this.http.post(
            `${this.apiUrl}${endPoint}`,
            body,
            { headers, params }
        );
    }

}