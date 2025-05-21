import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '../shared/confirm-delete/confirm.service';
import { AccountService } from '../entities/account.service';
import { HypotheticalService } from '../entities/hypothetical.service';
import { Hypothetical } from './hypothetical';

@Component({
  selector: 'app-hypothetical',
  templateUrl: './hypothetical.component.html',
  styleUrl: './hypothetical.component.scss',
  standalone: false
})
export class HypotheticalComponent implements OnInit {


  /* 
    There should be a defaults the user can clone or create new
    Min payments vs high interest rate vs snowball
    The user should be able to make a new hypothetical where they can choose multiple payments to a CC/Loan in a month
    The CC/loan/Savings must also include
        * How much interest was accured for the month
        * How much interest was paid for the month
        * How much interest was accured for it's entirety
        * How many months left to pay down a loan / CC based on previous payment
  */

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private hypoService = inject(HypotheticalService);
  private confirmService = inject(ConfirmService);

  hypo = new Hypothetical();

  async ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    const hypo = await this.hypoService.getById(id);

    if (!hypo) {
      this.router.navigate(['/account-list']);
      return;
    }

    this.hypo = hypo as Hypothetical;
  }

  save = async () => {
    await this.hypoService.save(this.hypo);
    this.router.navigate(['/account-list']);
  }

  confirmDelete = async () => {
    const confirmed = await this.confirmService.open('Are you sure you want to delete this hypothetical?');

    if (confirmed) {
      await this.hypoService.delete(this.hypo.HypotheticalId);
      this.router.navigate(['/account-list']);
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyEvent = (event: Event) => {
    if ((event as KeyboardEvent).code === 'Escape') {
      // Probably need to confirm with the user
      this.router.navigate(['/account-list']);
    } else if ((event as KeyboardEvent).code === 'Enter' || (event as KeyboardEvent).code === 'NumpadEnter') {
      this.save();
    }
  }
}
