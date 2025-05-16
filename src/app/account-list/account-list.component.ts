import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { Account } from '../entities/account';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  standalone: false
})
export class AccountListComponent implements OnInit {
  @ViewChild('newAccountInput') newAccountInput!: ElementRef;
  newAccountName = '';
  accounts = new Array<Account>();

  private router = inject(Router);
  private accountService = inject(AccountService);

  async ngOnInit() {
    this.accounts = await this.accountService.getAccounts();
  }

  createNewAccount = () => {
    const newAccount = new Account();
    newAccount.Name = this.newAccountName;
    newAccount.AccountId = this.accounts.length + 1;
    this.accounts.push(newAccount);

    this.newAccountName = '';

    if (this.newAccountInput) {
      this.newAccountInput.nativeElement.focus();
    }
  }

  newAccountInputKeyDown = (keydown: KeyboardEvent) => {
    if (keydown.code === 'Enter' || keydown.code === 'NumpadEnter') {
      this.createNewAccount();
    }
  }

  editAccount = async (account: Account) => {
    await this.accountService.saveAccounts(this.accounts);
    this.router.navigate(['/account-edit', account.AccountId]);
  }
}
