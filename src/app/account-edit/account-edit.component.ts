import { Component, HostListener, inject, OnInit } from '@angular/core';
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
  borderColor = '';

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
    this.borderColor = this.rbgToHex(this.account.BorderColor);
  }

  accountTypeChange(event: Event) {
    if (this.account && event && event.target) {
      const selectHtmlElement = event.target as HTMLSelectElement
      this.accountType = selectHtmlElement.value;
      this.account.Type = +this.accountType as AccountType;
    }
  }

  onColorChangeBlur(event: Event) {
    const color = (event.target as any)?.value as string;

    if (color) {
      this.account.BorderColor = this.hexToRgb(color);
    }
  }

  hexToRgb = (hex: string): string => {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, 1)`;
  }

  componentToHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  rbgToHex = (borderColor: string): string => {
    if (!borderColor)
      return '#000';

    const regex = /\d+/g;
    const match = borderColor.match(regex);

    if (!match)
      return '#000;'

    return "#" + this.componentToHex(+match[0]) + this.componentToHex(+match[1]) + this.componentToHex(+match[1]);
  }

  setAccountTypeDropDown = () => {
    this.accountType = this.account.Type.toString() || '0';
  }

  save = async () => {
    await this.accountService.save(this.account);
    this.router.navigate(['/account-list']);
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
