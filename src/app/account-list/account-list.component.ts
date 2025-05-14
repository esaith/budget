import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  standalone: false
})
export class AccountListComponent {
    newAccountName = '';
    accounts = new Array<Account>();

    private router = inject(Router);

    createNewAccount = () => {
      const newAccount = new Account();
      newAccount.Name = this.newAccountName;
      newAccount.AccountId = this.accounts.length + 1;
      this.accounts.push(newAccount);

      this.newAccountName = '';
    }

    newAccountInputKeyDown = (keydown: KeyboardEvent) => {
      if (keydown.code === 'Enter' || keydown.keyCode === 13) {
      this.createNewAccount();
    }
  }

  editAccount = (account: Account) => {
    this.router.navigate(['/account-edit', account.AccountId]);
  }
}

export class Account {
  Name = '';
  AccountId = 0;
  Entries = new Array<Entry>()
}

export class Entry {
  Name = ''
  Desciption = ''
  Cost = 0
  Location = ''

}
