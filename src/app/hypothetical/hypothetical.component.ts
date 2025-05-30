import { ChangeDetectorRef, Component, HostListener, inject, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '../shared/confirm-delete/confirm.service';
import { AccountService } from '../entities/account.service';
import { HypotheticalService } from '../entities/hypothetical.service';
import { Hypothetical, HypotheticalAccount } from './hypothetical';
import { Account, AccountType, APR } from '../entities/account';
import { formatDate } from '@angular/common';
import { LogService } from '../entities/log.service';
import { Transaction } from '../entities/transaction';

@Component({
  selector: 'app-hypothetical',
  templateUrl: './hypothetical.component.html',
  styleUrl: './hypothetical.component.scss',
  standalone: false
})
export class HypotheticalComponent implements OnInit, AfterViewInit {


  /* 
    There should be a defaults the user can clone or create new
    Min payments vs high interest rate vs snowball
    The user should be able to make a new hypothetical where they can choose multiple payments to a CC/Loan in a month
    The CC/loan/Savings must also include
        * How much interest was accured for the month
        * How much interest was paid for the month
        * How much interest was accured for it's entirety
        * How many months left to pay down a loan / CC based on previous payment
  */

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private hypoService = inject(HypotheticalService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private logService = inject(LogService);

  hypo = new Hypothetical();
  accounts = new Array<Account>();
  endDate = formatDate(new Date(Date.now()), 'yyyy-MM-dd', 'en-US');
  endDateRangeOptions = ['', '7 days (1 week)', '30 days (1 month)', '90 days (3 months)', '180 days (6 months)', '270 days (9 months)', '360 days (12 months)'];
  endRange = '';

  async ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    const hypo = await this.hypoService.getById(id);

    if (!hypo) {
      this.router.navigate(['/account-list']);
      return;
    }

    this.hypo = hypo as Hypothetical;
    this.accounts = await this.accountService.getAccounts();

    this.createHypoAccountPerAccount();
  }

  ngAfterViewInit() {
    this.cdr.markForCheck();
  }

  save = async () => {
    await this.hypoService.save(this.hypo);
    this.router.navigate(['/account-list']);
  }

  confirmDelete = async () => {
    const confirmed = await this.confirmService.open('Are you sure you want to delete this hypothetical?');

    if (confirmed) {
      await this.hypoService.delete(this.hypo.HypotheticalId);
      this.router.navigate(['/account-list']);
    }
  }

  endRangeChange = (event: Event) => {
    let diff = 0;
    const endDateRangeStr = (event.target as any)?.value as string;
    const index = this.endDateRangeOptions.findIndex(x => x === endDateRangeStr);

    switch (index) {
      case 1:
        diff = 7
        break;
      case 2:
        diff = 30;
        break;
      case 3:
        diff = 30 * 3;
        break;
      case 4:
        diff = 30 * 6;
        break;
      case 5:
        diff = 30 * 9;
        break;
      case 6:
        diff = 30 * 12;
        break;
      default:
        return;
    }

    const date = new Date(Date.now());
    date.setDate(date.getDate() + diff);

    this.endDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.onDateChange(date.toDateString());
  }

  onDateChange = (endDateStr: string, startDate: Date | null = null) => {
    if (startDate == null)
      startDate = new Date(Date.now());

    startDate.setHours(0, 0, 0, 0);

    if (!endDateStr)
      endDateStr = new Date(Date.now()).toDateString();

    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);

    this.calculateAccountBalance(startDate, endDate);
  }

  private calculateAccountBalance = (startDate: Date, endDate: Date) => {
    const numOfDays = this.getDateDiff(startDate, endDate);

    this.createHypoAccountPerAccount();

    for (const hypoAccount of this.hypo.Accounts) {
      hypoAccount.DailyBalance = new Array<number>();
      hypoAccount.Transactions = new Array<Transaction>();

      const account = this.accounts.find(x => x.AccountId === hypoAccount.AccountId);
      if (!account) {
        this.logService.addLog('Missing account by Id when calculating account diff in hypotheticals', 'error');
        continue;
      }

      if (account.Type === AccountType.CreditCard) {

        /* Need to find out if there was a previous balance after last due date. If so, calculate daily compound
            interest. If not, do nothing. For now, we will assume there was a balance.
        */

        hypoAccount.DailyBalance.push(account.Balance);

        for (let i = 1; i <= numOfDays; ++i) {

          if (hypoAccount.DailyBalance[i - 1] < 0) {

            const transaction = new Transaction();
            transaction.AccountId = account.AccountId;

            const date = new Date(startDate.valueOf());
            date.setDate(date.getDate() + (i - 1));
            const dailyInterestRate = this.getDailyInterestRate(date, account);

            transaction.Amount = hypoAccount.DailyBalance[i - 1] * dailyInterestRate;
            transaction.Category = 'Interest';
            transaction.Description = 'Daily Accrued Interest'

            hypoAccount.Transactions.push(transaction);

            const newBalance = hypoAccount.DailyBalance[i - 1] + transaction.Amount;
            hypoAccount.DailyBalance.push(newBalance)
          } else {
            hypoAccount.DailyBalance.push(hypoAccount.DailyBalance[i - 1])
          }
        }

        const accruedInterest = hypoAccount.Transactions
          .filter(x => x.Category === 'Interest')
          .map(x => x.Amount)
          .reduce((prev, curr) => prev + curr, 0)

        if (numOfDays > 0) {
          console.log(`After ${numOfDays} days, ${account.Name} has 
          a starting balance of ${hypoAccount.DailyBalance[0].toFixed(2)},
          an ending balance of ${hypoAccount.DailyBalance[numOfDays - 1].toFixed(2)},
          with accured interest of ${accruedInterest.toFixed(2)}`);
        } else {
          console.log(`After 0 days, ${account.Name} has 
          a starting balance of ${hypoAccount.DailyBalance[0].toFixed(2)},
          an ending balance of ${hypoAccount.DailyBalance[0].toFixed(2)},
          with accured interest of ${accruedInterest.toFixed(2)}`);
        }
      }
    }
  }

  private createHypoAccountPerAccount = () => {
    for (let account of this.accounts) {
      if (!this.hypo.Accounts.some(x => x.AccountId === account.AccountId)) {
        const newHypotheticalAccount = new HypotheticalAccount();
        newHypotheticalAccount.AccountId = account.AccountId;
        this.hypo.Accounts.push(newHypotheticalAccount);
      }
    }
  }

  private getDailyInterestRate(date: Date, account: Account): number {
    if (!account.APR)
      return 0;

    if (account.APRPromo && this.withinAPRPromoRange(date, account.APRPromo.StartDate, account.APRPromo.EndDate)) {
      return (account.APRPromo.Rate / 100) / (this.isLeapYear() ? 366 : 365);
    } else {
      return (account.APR / 100) / (this.isLeapYear() ? 366 : 365);
    }
  }

  private withinAPRPromoRange = (date: Date, startDate: Date, endDate: Date): boolean => {
    return startDate <= date && date <= endDate;
  }

  private isLeapYear(): boolean {
    const date = new Date(Date.now());
    return ((date.getFullYear() % 4 == 0) && (date.getFullYear() % 100 != 0)) || (date.getFullYear() % 400 == 0);
  }

  private getDateDiff = (date1: Date, date2: Date): number => {
    const diffMs = date2.getTime() - date1.getTime();
    const diffSec = diffMs / 1000;
    const diffMin = diffSec / 60;
    const diffHr = diffMin / 60;
    const diffDays = diffHr / 24;
    return Math.floor(diffDays) + 1;
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
