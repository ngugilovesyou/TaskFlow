// src/app/services/login.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { login } from '../models/type.login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loginData: Array<login> | undefined

  http=inject(HttpClient)
  handleLogin(payload: login) {
   return this.http.post("http://127.0.0.1:5000/login", payload)
  }
  handleRegister(payload: login) {
   return this.http.post("http://127.0.0.1:5000/users", payload)
  }

  updateUser(userId: string | number, payload: Partial<login>) {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.put(`http://127.0.0.1:5000/users/${userId}`, payload, { headers });
}

}
