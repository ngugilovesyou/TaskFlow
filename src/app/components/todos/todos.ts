// src/app/components/todos/todos.ts
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { TodosService } from '../../services/todos';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, UserUpdatePayload } from '../../services/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


interface Todo {
  id: number;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-todos',
  imports: [FormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './todos.html',
  styleUrl: './todos.css',
})
export class TodosComponent {
  todoService = inject(TodosService);
  userService = inject(UserService);
  snack = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);

  dropdownOpen = false;
profileModalOpen = false;
deleteModalOpen = false;
todoToDeleteId: number | null = null;


username = localStorage.getItem('username') || '';

updatedUsername = '';
updatedPassword = '';


  content = "";
  completed = false;
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: (Date | null)[] = [];
  viewMode: 'list' | 'calendar' = 'list';
  filterMode: 'all' | 'active' | 'completed' = 'all';

  ngOnInit() {
    this.loadTodos();
    this.generateCalendar();
  }

  toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

openProfileModal() {
  this.updatedUsername = '';
  this.profileModalOpen = true;
}


closeProfileModal() {
  this.profileModalOpen = false;
}



logout() {
    localStorage.removeItem('token');
  }
  loadTodos() {
    this.todoService.getTodos().subscribe({
      next: (res: any) => {
        console.log("Todos loaded:", res);
        this.todos = res;
        this.applyFilter();
         this.cd.detectChanges();
      }
    });
  }

 handleAddTodo() {
  if (!this.content.trim()) {
    this.snack.open("Please enter a todo item", "OK", {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
    return;
  }

  const payload = {
    content: this.content,
    completed: this.completed,
  };

  this.todoService.addTodo(payload).subscribe({
    next: (res) => {
      this.snack.open("Todo added successfully!", "OK", {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.content = "";
      this.loadTodos();
    },
    error: (err) => {
      console.error(err);
      this.snack.open("Failed to add todo", "Close", {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}



openDeleteModal(id: number) {
  this.todoToDeleteId = id;
  this.deleteModalOpen = true;
}



confirmDelete() {
  if (this.todoToDeleteId !== null) {
    this.todoService.deleteTodo(this.todoToDeleteId).subscribe({
      next: () => {
        this.loadTodos();
        this.closeDeleteModal();
        this.snack.open("Todo deleted successfully!", "OK", {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: (err) => {
        console.error(err);
        this.snack.open("Failed to delete todo", "Close", {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}


closeDeleteModal() {
  this.deleteModalOpen = false;
  this.todoToDeleteId = null;
}


  handleToggle(todo: Todo) {
  this.todoService.updateTodo(todo.id, { completed: !todo.completed }).subscribe({
    next: () => {
      const message = todo.completed ? "Marked as incomplete!" : "Marked as complete!";
      this.snack.open(message, "OK", {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.loadTodos();
    },
    error: (err) => {
      console.error(err);
      this.snack.open("Failed to update todo", "Close", {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}


  applyFilter() {
    switch (this.filterMode) {
      case 'active':
        this.filteredTodos = this.todos.filter(t => !t.completed);
        break;
      case 'completed':
        this.filteredTodos = this.todos.filter(t => t.completed);
        break;
      default:
        this.filteredTodos = this.todos;
    }
  }

  setFilter(mode: 'all' | 'active' | 'completed') {
    this.filterMode = mode;
    this.applyFilter();
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    this.calendarDays = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(new Date(year, month, day));
    }
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(date: Date | null) {
    if (date) {
      this.selectedDate = date;
    }
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelectedDate(date: Date | null): boolean {
    if (!date) return false;
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }

  getTodosForDate(date: Date): Todo[] {
    return this.todos.filter(todo => {
      const todoDate = new Date(todo.created_at);
      return todoDate.getDate() === date.getDate() &&
             todoDate.getMonth() === date.getMonth() &&
             todoDate.getFullYear() === date.getFullYear();
    });
  }

  getTodosForSelectedDate(): Todo[] {
    return this.getTodosForDate(this.selectedDate);
  }

  getMonthYear(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getCompletedCount(): number {
    return this.todos.filter(t => t.completed).length;
  }

  getActiveCount(): number {
    return this.todos.filter(t => !t.completed).length;
  }

  getTodayCount(): number {
    const today = new Date();
    return this.getTodosForDate(today).length;
  }

saveProfile() {
  const payload: UserUpdatePayload = {};
  if (this.updatedUsername && this.updatedUsername !== this.username) {
    payload.username = this.updatedUsername;
  }
  if (this.updatedPassword) payload.password = this.updatedPassword;

  this.userService.updateUser(payload).subscribe({
    next: (res) => {
      this.snack.open('Profile updated!', 'OK', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

      localStorage.setItem('username', res.username);
      this.username = res.username;

      this.closeProfileModal();
    },
    error: (err) => {
      console.error(err);
      this.snack.open('Failed to update profile', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}

}