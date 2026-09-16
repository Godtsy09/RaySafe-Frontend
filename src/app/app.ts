import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentList } from './views/admin/agent-list/agent-list';
import { AgentLogs } from './views/admin/agent-logs/agent-logs';
import { UnassignedReports } from './views/agent/unassigned-reports/unassigned-reports';
import { AssignedReports } from './views/agent/assigned-reports/assigned-reports';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgentList, AgentLogs,UnassignedReports,AssignedReports], // Agregamos AgentListComponent aquí
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('raysafe');
}