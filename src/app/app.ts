import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}