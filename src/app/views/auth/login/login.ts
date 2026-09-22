import { Component } from '@angular/core';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

@Component({
  imports: [HeaderUserComponent],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {}
