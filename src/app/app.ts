import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentList } from './views/admin/agent-list/agent-list';
import { AgentLogs } from './views/admin/agent-logs/agent-logs';
import { UnassignedReports } from './views/agent/unassigned-reports/unassigned-reports';
import { AssignedReports } from './views/agent/assigned-reports/assigned-reports';
import { AdjuntarEvidencia } from './views/user/adjuntar-evidencia/adjuntar-evidencia';
import { ConsultarDenuncia } from './views/user/consultar-denuncia/consultar-denuncia';
import { EstadisticasDeAbuso } from './views/user/estadisticas-abuso/estadisticas-abuso';
import { RealizarDenunciaComponent } from './views/user/realizar-denuncia/realizar-denuncia';
import { RecursosDeAyuda } from './views/user/recursos-de-ayuda/recursos-de-ayuda';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgentList, AgentLogs,UnassignedReports,AssignedReports,AdjuntarEvidencia,ConsultarDenuncia, EstadisticasDeAbuso,RealizarDenunciaComponent,RecursosDeAyuda], // Agregamos AgentListComponent aquí
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('raysafe');
}