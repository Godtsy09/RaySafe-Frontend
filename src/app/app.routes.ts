import { Routes } from '@angular/router';
import { RegisterAgent } from './views/admin/register-agent/register-agent';
import { Login } from './views/auth/login/login';
import { Start } from './views/user/start/start';

export const routes: Routes = [
  { path: 'register-agent', component: RegisterAgent },
  { path: 'login', component: Login},
  { path: 'start', component: Start}
];
