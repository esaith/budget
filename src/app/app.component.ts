import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<div class="bg-white dark:bg-gray-800 min-h-screen">
    <app-confirm-delete></app-confirm-delete>
    <router-outlet />
    </div>`,
  standalone: false
})
export class AppComponent {
}

