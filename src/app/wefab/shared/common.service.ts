import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Route } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../enviornments/enviornment';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})

export class CommonService {

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
    
}
