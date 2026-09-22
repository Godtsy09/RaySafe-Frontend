import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

@Component({
  imports: [HeaderUserComponent, RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
