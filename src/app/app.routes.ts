import { Routes } from '@angular/router';
import { RegisterAgentComponent } from './views/admin/registerAgent';
import { LoginComponent } from './views/auth/login';

export const routes: Routes = [
  { path: 'register-agent', component: RegisterAgentComponent },
  { path: 'login', component: LoginComponent}
];
