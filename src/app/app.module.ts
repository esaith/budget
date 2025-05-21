import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AccountEditComponent } from './account-edit/account-edit.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AppRoutingModule } from './app.routes';
import { ConfirmDeleteComponent } from './shared/confirm-delete/confirm-delete.component';
import { BudgetItemEditComponent } from './budget-item-edit/budget-item-edit.component';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { HypotheticalComponent } from './hypothetical/hypothetical.component';


@NgModule({
  declarations: [
    AppComponent,
    AccountEditComponent,
    AccountListComponent,
    BudgetItemEditComponent,
    ConfirmDeleteComponent,
    HypotheticalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CdkDropList,
    CdkDrag
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
