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
    return this.http.post("https://taskflow-azrb.onrender.com/todos", payload, { headers });
  }

  // Get all todos
  getTodos() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found, user is not logged in');
  }

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<Todos[]>("https://taskflow-azrb.onrender.com/todos", { headers });
}


  // Update todo
  updateTodo(id: number, payload: Partial<Todos>) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch(`https://taskflow-azrb.onrender.com/todos/${id}`, payload, { headers });
  }

  // Delete todo
  deleteTodo(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete(`https://taskflow-azrb.onrender.com/todos/${id}`, { headers });
  }
}

