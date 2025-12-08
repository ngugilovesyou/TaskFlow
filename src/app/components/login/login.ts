// src/app/components/login/login.ts
import { Component, inject } from '@angular/core';
import { LoginService } from '../../services/login';
import { login } from '../../models/type.login';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule, MatSnackBarModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  constructor(private router: Router) {}

  loginService = inject(LoginService);
  userService = inject(UserService);
  snack = inject(MatSnackBar);

  isLogin = true;
 
  profileModalOpen = false;
  
updatedUsername = '';
updatedPassword = '';
  username = '';
  password = '';
  
  regUsername = '';
  regPassword = '';


  toggleForm() {
  this.isLogin = !this.isLogin;
}
submitRegister() {
  const payload: login = {
    username: this.regUsername,
    password: this.regPassword
  };

  this.loginService.handleRegister(payload).subscribe({
    next: (res: any) => {
      this.snack.open("User created successfully!", "OK", {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/home']);
    },
    error: (err: any) => {
      this.snack.open("Failed to create user", "Close", {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      console.error("Error:", err);
    }
  });
}


submitLogin() {
  const payload: login = {
    username: this.username,
    password: this.password
  };

  this.loginService.handleLogin(payload).subscribe({
    next: (res: any) => {
      this.snack.open("Login successful!", "OK", {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

      localStorage.setItem("token", res.user.access_token);
      localStorage.setItem("user_id", res.user.id);
      localStorage.setItem("username", this.username);

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 50);
    },
    error: (err: any) => {
      this.snack.open("Invalid username or password", "Close", {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      console.error("Error:", err);
    }
  });
}

}
