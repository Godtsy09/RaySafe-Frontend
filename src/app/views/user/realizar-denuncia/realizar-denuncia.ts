import { Component } from '@angular/core';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';
import { AdjuntarEvidencia } from '../adjuntar-evidencia/adjuntar-evidencia';

@Component({
  imports: [HeaderUserComponent, AdjuntarEvidencia],
  selector: 'app-realizar-denuncia',
  templateUrl: './realizar-denuncia.html',
  styleUrl: './realizar-denuncia.css',
})
export class RealizarDenunciaComponent {}