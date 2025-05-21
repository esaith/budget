import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Account, AccountType, APR } from '../entities/account';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../entities/account.service';
import { ConfirmService } from '../shared/confirm-delete/confirm.service';

@Component({
  selector: 'app-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrl: './account-edit.component.scss',
  standalone: false
})
export class AccountEditComponent implements OnInit {
  account = new Account();
  accountType = "";
  newAPR = new APR();
  AccountType = AccountType;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private confirmService = inject(ConfirmService);

  async ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    const account = await this.accountService.getAccountById(id);

    if (!account) {
      this.router.navigate(['/account-list']);
      return;
    }

    if (!account.APRPromo) {
      account.APRPromo = new APR();
    }

    this.account = account as Account;
    this.setAccountTypeDropDown();
  }

  accountTypeChange(event: Event) {
    if (this.account && event && event.target) {
      const selectHtmlElement = event.target as HTMLSelectElement
      this.accountType = selectHtmlElement.value;
      this.account.Type = +this.accountType as AccountType;
    }
  }

  setAccountTypeDropDown = () => {
    this.accountType = this.account.Type.toString() || '0';
  }

  save = async () => {
    await this.accountService.save(this.account);
    this.router.navigate(['/account-list']);
  }
}
