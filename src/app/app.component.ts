import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  styleUrl: './app.component.scss',
  standalone: false
  })
  export class AppComponent {
    title = 'budget';
  }

