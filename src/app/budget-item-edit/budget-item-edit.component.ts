import { Component, inject } from '@angular/core';
import { BudgetItem } from '../entities/budgetItem';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetItemService } from '../entities/budget.service';
import { ConfirmService } from '../shared/confirm-delete/confirm.service';
import { AccountService } from '../entities/account.service';
import { Account } from '../entities/account';

@Component({
  selector: 'app-budget-item-edit',
  templateUrl: './budget-item-edit.component.html',
  styleUrl: './budget-item-edit.component.scss',
  standalone: false
})
export class BudgetItemEditComponent {
  budgetItem = new BudgetItem();
  budgetItemTypes = new Array<string>();
  frequency = ['Days', 'Weeks', 'Months'];
  accounts = new Array<Account>();

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private budgetItemService = inject(BudgetItemService);
  private confirmService = inject(ConfirmService);
  private accountService = inject(AccountService);

  async ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    const budgetItem = await this.budgetItemService.getById(id);

    if (!budgetItem) {
      this.router.navigate(['/account-list']);
    }

    this.budgetItemTypes = await this.budgetItemService.getBudgetItemTypes();
    this.budgetItem = budgetItem as BudgetItem;
    this.accounts = await this.accountService.getAccounts();
  }

  budgetItemTypeChange(event: Event) {
    if (this.budgetItem && event && event.target) {
      const selectHtmlElement = event.target as HTMLSelectElement
      this.budgetItem.Type = selectHtmlElement.value;
    }
  }
  budgetItemFrequencyChange(event: Event) {
    if (this.budgetItem && event && event.target) {
      const selectHtmlElement = event.target as HTMLSelectElement
      this.budgetItem.Frequency = selectHtmlElement.value;
    }
  }

  save() {
    this.budgetItemService.saveBudgetItem(this.budgetItem);
    this.router.navigate(['/account-list']);
  }

  confirmDelete = async () => {
    const confirmed = await this.confirmService.open('Are you sure you want to delete this budget item?');

    if (confirmed) {
      this.budgetItemService.delete(this.budgetItem.BudgetItemId);
      this.router.navigate(['/account-list']);
    }
  }
}
