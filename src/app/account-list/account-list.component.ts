import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Account, AccountType } from '../entities/account';
import { AccountService } from '../entities/account.service';
import { BudgetItem } from '../entities/budgetItem';
import { BudgetItemService } from '../entities/budget.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  standalone: false
})
export class AccountListComponent implements OnInit {
  @ViewChild('newAccountInput') newAccountInput!: ElementRef;
  @ViewChild('newBudgetItemInput') newBudgetItemInput!: ElementRef;
  newAccountName = '';
  newBudgetItemName = '';
  accounts = new Array<Account>();
  budgetItems = new Array<BudgetItem>();
  AccountType = AccountType;

  private router = inject(Router);
  private accountService = inject(AccountService);
  private budgetItemService = inject(BudgetItemService);

  async ngOnInit() {
    this.accounts = await this.accountService.getAccounts();
    this.budgetItems = await this.budgetItemService.getBudgetItems();
  }

  createNewAccount = () => {
    if (!this.newAccountName) {
      return;
    }

    const newAccount = new Account();
    newAccount.Name = this.newAccountName;
    newAccount.AccountId = this.accounts.length + 1;

    this.accountService.saveAccount(newAccount);
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
    this.router.navigate(['/account-edit', account.AccountId]);
  }

  editBudgetItem = async (budgetItem: BudgetItem) => {
    this.router.navigate(['/budget-item-edit', budgetItem.BudgetItemId]);
  }

  createNewBudgetItem = () => {
    if (!this.newBudgetItemName) {
      return;
    }

    const newBudgetItem = new BudgetItem();
    newBudgetItem.Name = this.newBudgetItemName;
    newBudgetItem.BudgetItemId = this.budgetItems.length + 1

    this.budgetItemService.saveBudgetItem(newBudgetItem);
    this.budgetItems.push(newBudgetItem);

    this.newBudgetItemName = '';

    if (this.newBudgetItemInput) {
      this.newBudgetItemInput.nativeElement.focus();
    }
  }

  newBudgetInputKeyDown = (keydown: KeyboardEvent) => {
    if (keydown.code === 'Enter' || keydown.code === 'NumpadEnter') {
      this.createNewBudgetItem();
    }
  }
}
