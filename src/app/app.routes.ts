import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountEditComponent } from './account-edit/account-edit.component';

const routes: Routes = [
  { path: 'account-edit/:id', component: AccountEditComponent },
  { path: 'account-list', component: AccountListComponent },
  { path: '', component: AccountListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
