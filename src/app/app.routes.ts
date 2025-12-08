import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { TodosComponent } from './components/todos/todos';
import { authGuard } from './auth-guard';

export const routes: Routes = [
    {
        path:"", redirectTo:"home", pathMatch:"full" 
    },
    {
        path:"home", component:TodosComponent, canActivate:([authGuard])
    },
    {
        path:"login", component:LoginComponent
    }
];
