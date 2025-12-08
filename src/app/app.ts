import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TodosComponent } from './components/todos/todos';
import { LoginComponent } from './components/login/login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router: Router) {}
logout() {
  localStorage.removeItem("token");
  this.router.navigate(['/login'])
}
  protected readonly title = signal('Todos');
}
