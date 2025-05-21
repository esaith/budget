import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountEditComponent } from './account-edit/account-edit.component';
import { BudgetItemEditComponent } from './budget-item-edit/budget-item-edit.component';
import { Hypothetical } from './hypothetical/hypothetical';
import { HypotheticalComponent } from './hypothetical/hypothetical.component';

const routes: Routes = [
  { path: 'account-edit/:id', component: AccountEditComponent },
  { path: 'budget-item-edit/:id', component: BudgetItemEditComponent },
  { path: 'hypothetical/:id', component: HypotheticalComponent },
  { path: 'account-list', component: AccountListComponent },
  { path: '', component: AccountListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
