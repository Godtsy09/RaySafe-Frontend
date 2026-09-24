import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';
import { Footer } from '../../../components/footer/footer';

@Component({
  imports: [HeaderUserComponent, RouterLink, Footer],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
