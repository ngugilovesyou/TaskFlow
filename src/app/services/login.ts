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
   return this.http.post("https://taskflow-azrb.onrender.com/login", payload)
  }
  handleRegister(payload: login) {
   return this.http.post("https://taskflow-azrb.onrender.com/users", payload)
  }

  updateUser(userId: string | number, payload: Partial<login>) {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.put(`https://taskflow-azrb.onrender.com/users/${userId}`, payload, { headers });
}

}
