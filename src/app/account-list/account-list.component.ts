import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Account, AccountType } from '../entities/account';
import { AccountService } from '../entities/account.service';
import { BudgetItem } from '../entities/budgetItem';
import { BudgetItemService } from '../entities/budget.service';
import { sortByOrder } from '../entities/helper';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { Hypothetical } from '../hypothetical/hypothetical';
import { HypotheticalService } from '../entities/hypothetical.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
  standalone: false
})
export class AccountListComponent implements OnInit {
  @ViewChild('newAccountInput') newAccountInput!: ElementRef;
  @ViewChild('newBudgetItemInput') newBudgetItemInput!: ElementRef;
  @ViewChild('newHypoInput') newHypoInput!: ElementRef;

  newAccountName = '';
  newBudgetItemName = '';
  newHypoName = ''

  accounts = new Array<Account>();
  budgetItems = new Array<BudgetItem>();
  hypotheticals = new Array<Hypothetical>();
  AccountType = AccountType;

  private router = inject(Router);
  private accountService = inject(AccountService);
  private budgetItemService = inject(BudgetItemService);
  private hypotheticalService = inject(HypotheticalService)

  async ngOnInit() {
    this.accounts = await this.accountService.getAccounts();
    this.accounts.sort(sortByOrder);

    this.budgetItems = await this.budgetItemService.getBudgetItems();
    this.hypotheticals = await this.hypotheticalService.getAll();
  }

  createNewAccount = () => {
    if (!this.newAccountName) {
      return;
    }

    const newAccount = new Account();
    newAccount.Name = this.newAccountName;
    newAccount.AccountId = this.accounts.length + 1;

    this.accountService.save(newAccount);
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

  editHypothetical = async (hypo: Hypothetical) => {
    this.router.navigate(['/hypothetical', hypo.HypotheticalId]);
  }

  createNewBudgetItem = () => {
    if (!this.newBudgetItemName) {
      return;
    }

    const newBudgetItem = new BudgetItem();
    newBudgetItem.Name = this.newBudgetItemName;
    newBudgetItem.BudgetItemId = this.budgetItems.length + 1

    this.budgetItemService.save(newBudgetItem);
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

  newHypoInputKeyDown = (keydown: KeyboardEvent) => {
    if (keydown.code === 'Enter' || keydown.code === 'NumpadEnter') {
      this.createNewHypothetical();
    }
  }

  createNewHypothetical = () => {
    if (!this.newHypoName) {
      return;
    }

    const newHypo = new Hypothetical();
    newHypo.Name = this.newHypoName;

    this.hypotheticalService.save(newHypo);
    this.hypotheticals.push(newHypo);

    this.newHypoName = '';

    if (this.newBudgetItemInput) {
      this.newBudgetItemInput.nativeElement.focus();
    }
  }

  dropAccounts(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.accounts, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.accounts.length; ++i) {
      this.accounts[i].Order = i;
    }

    this.accountService.saveMany(this.accounts);
  }

  dropBudgetItems(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.budgetItems, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.budgetItems.length; ++i) {
      this.budgetItems[i].Order = i;
    }

    this.budgetItemService.saveMany(this.budgetItems);
  }

  dropHypotheticals(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.hypotheticals, event.previousIndex, event.currentIndex);

    for (let i = 0; i < this.hypotheticals.length; ++i) {
      this.hypotheticals[i].Order = i;
    }

    this.hypotheticalService.saveMany(this.hypotheticals);
  }
}
