import { Component, inject, OnInit } from '@angular/core';
import { ConfirmService } from './confirm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.scss',
  standalone: false
})
export class ConfirmDeleteComponent implements OnInit {
  private subscription!: Subscription;

  confirmationService = inject(ConfirmService);
  showing = false;
  title = '';
  message = 'Are you sure you want to delete this item?';

  ngOnInit() {
    this.subscription = this.confirmationService.confirm$.subscribe({
      next: (data) => {
        if (data) {
          this.showing = true;
          this.title = data.title;
          this.message = data.message;
        } else {
          this.showing = false;
          this.title = '';
          this.message = '';
        }
      }
    })
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  confirm() {
    this.confirmationService.confirmed$.next(true);
    this.showing = false;
  }

  cancel() {
    this.confirmationService.confirmed$.next(false);
    this.showing = false;
  }
}
