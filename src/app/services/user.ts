// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserUpdatePayload {
  username?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  updateUser(payload: UserUpdatePayload): Observable<any> {
    const userId = localStorage.getItem('user_id');
    if (!userId) throw new Error('User not found');
    return this.http.put(`https://taskflow-azrb.onrender.com/users/${userId}`, payload, this.getHeaders());
  }
}
