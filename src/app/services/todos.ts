import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Todos } from '../models/type.todos';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  http=inject(HttpClient)
  todos: Todos[] = []; 

   // Add a new todo
  addTodo(payload: Todos) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post("http://127.0.0.1:5000/todos", payload, { headers });
  }

  // Get all todos
  getTodos() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found, user is not logged in');
  }

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<Todos[]>("http://127.0.0.1:5000/todos", { headers });
}


  // Update todo
  updateTodo(id: number, payload: Partial<Todos>) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch(`http://127.0.0.1:5000/todos/${id}`, payload, { headers });
  }

  // Delete todo
  deleteTodo(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete(`http://127.0.0.1:5000/todos/${id}`, { headers });
  }
}

