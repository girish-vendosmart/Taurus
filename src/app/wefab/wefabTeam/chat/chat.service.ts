import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>('assets/chat-users.json');
  }

  getMessages(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`assets/chat-messages-${userId}.json`);
  }
} 