import { Component } from '@angular/core';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

//url es el enlace de descarga del documento pdf en la bd, por ahora va a quedar vacio y el
//template usa # como placeholder hasta que llegue de la base de datos

interface Pdf {
  nombre: string;
  tag: string;
  paginas: number;
  claseIcono: string;
  url: string;
}

interface Institucion {
  tipo: string;
  claseTag: string;
  nombre: string;
  ubicacion: string;
  telefono: string;
  horario: string;
}

@Component({
  imports: [HeaderUserComponent],
  selector: 'app-help-resources',
  styleUrl: './help-resources.css',
  templateUrl: './help-resources.html',
})
export class HelpResources {
  
  //Datos sobrepuestos de los 6 PDFs mostrados en la vista
  //queda pendiente cambiar ete array por al consulta a la base de datos
  readonly pdfs: Pdf[] = [
    { nombre: 'Ley para Prevenir, Sancionar y Erradicar la Violencia Intrafamiliar (Decreto 97-96)', tag: 'Legal', paginas: 34, claseIcono: 'pdf-icon--blue', url: '' },
    { nombre: 'Legislación guatemalteca contra la violencia hacia la mujer y la niñez', tag: 'Legal', paginas: 28, claseIcono: 'pdf-icon--red', url: '' },
    { nombre: 'Peores formas de trabajo infantil en Guatemala: avances y retos', tag: 'Infantil', paginas: 20, claseIcono: 'pdf-icon--purple', url: '' },
    { nombre: 'Las instituciones educativas frente al maltrato infantil', tag: 'Educación', paginas: 16, claseIcono: 'pdf-icon--green', url: '' },
    { nombre: 'Normativa de la Unidad de Bienestar Animal de Guatemala', tag: 'Animal', paginas: 12, claseIcono: 'pdf-icon--tan', url: '' },
    { nombre: 'Marco regulatorio de la Unidad de Bienestar Animal (Acuerdo Ministerial)', tag: 'Animal', paginas: 14, claseIcono: 'pdf-icon--gray', url: '' },
  ];

  //Datos sobrepuestos de las instituciones de apoyo mostradas en la vista
  //queda pendiente cambiar ete array por al consulta a la bd
  //(instituciones con type 'support_center' | 'shelter').
  readonly instituciones: Institucion[] = [
    { tipo: 'Centro de apoyo', claseTag: 'institucion-tag--support', nombre: 'Centro de Apoyo Integral a la Mujer (CAIMU)', ubicacion: 'Zona 1, Ciudad de Guatemala', telefono: '3630-7574', horario: 'Lunes a viernes 8:00-16:00' },
    { tipo: 'Centro de apoyo', claseTag: 'institucion-tag--support', nombre: 'Procuraduría de la Niñez y Adolescencia', ubicacion: 'Zona 4, Ciudad de Guatemala', telefono: '2410-0900', horario: 'Lunes a viernes 8:00-16:00' },
    { tipo: 'Centro de apoyo', claseTag: 'institucion-tag--support', nombre: 'Secretaría contra la Violencia Sexual, Explotación y Trata (SVET)', ubicacion: 'Zona 9, Ciudad de Guatemala', telefono: '2295-7800', horario: 'Lunes a viernes 8:00-17:00' },
    { tipo: 'Centro de apoyo', claseTag: 'institucion-tag--support', nombre: 'Centro de Atención UBA', ubicacion: 'Zona 12, Ciudad de Guatemala', telefono: '2470-2323', horario: 'Lunes a viernes 8:00-17:00' },
    { tipo: 'Refugio', claseTag: 'institucion-tag--shelter', nombre: 'Refugio de la Niñez', ubicacion: 'Zona 7, Ciudad de Guatemala', telefono: '2260-4260', horario: '24 horas' },
    { tipo: 'Refugio', claseTag: 'institucion-tag--shelter', nombre: 'Casa de Acogida para Mujeres', ubicacion: 'Mixco, Guatemala', telefono: '2429-1000', horario: '24 horas' },
    { tipo: 'Refugio', claseTag: 'institucion-tag--shelter', nombre: 'Refugio Animal Huellitas Felices', ubicacion: 'Villa Nueva, Guatemala', telefono: '5520-1234', horario: 'Lunes a viernes 8:00-17:00' },
    { tipo: 'Refugio', claseTag: 'institucion-tag--shelter', nombre: 'Santuario Animal Nueva Esperanza', ubicacion: 'Santa Lucía Cotzumalguapa, Escuintla', telefono: '7890-4567', horario: 'Domingo a sábado 9:00-17:00' },
  ];

  //Es el estado del modal de detalle de institución: cerrado por defecto.
  institucionSeleccionada: Institucion | null = null;

  abrirDetalle(institucion: Institucion): void {
    this.institucionSeleccionada = institucion;
  }

  cerrarModal(): void {
    this.institucionSeleccionada = null;
  }
}