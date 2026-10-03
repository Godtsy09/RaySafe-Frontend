import { Routes } from '@angular/router';
import { RegisterAgent } from './views/admin/register-agent/register-agent';
import { AgentList } from './views/admin/agent-list/agent-list';
import { AgentLogs } from './views/admin/agent-logs/agent-logs';
import { Login } from './views/auth/login/login';
import { UnassignedReports } from './views/agent/unassigned-reports/unassigned-reports';
import { AssignedReports } from './views/agent/assigned-reports/assigned-reports';
import { Home } from './views/user/home/home';
import { TrackReport } from './views/user/track-report/track-report';
import { CreateReport } from './views/user/create-report/create-report';
import { AbuseStats } from './views/user/abuse-stats/abuse-stats';
import { HelpResources } from './views/user/help-resources/help-resources';
import { NotFound } from './views/not-found/not-found';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'create-report', component: CreateReport },
  { path: 'track-report', component: TrackReport },
  { path: 'abuse-stats', component: AbuseStats },
  { path: 'help-resources', component: HelpResources },
  {
    path: 'unassigned-reports',
    component: UnassignedReports,
    canActivate: [roleGuard(['agente'])],
  },
  {
    path: 'assigned-reports',
    component: AssignedReports,
    canActivate: [roleGuard(['agente'])],
  },
  {
    path: 'agent-list',
    component: AgentList,
    canActivate: [roleGuard(['admin'])],
  },
  {
    path: 'register-agent',
    component: RegisterAgent,
    canActivate: [roleGuard(['admin'])],
  },
  {
    path: 'agent-logs',
    component: AgentLogs,
    canActivate: [roleGuard(['admin'])],
  },
  { path: '**', component: NotFound },
];