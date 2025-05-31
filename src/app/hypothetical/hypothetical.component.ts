import { ChangeDetectorRef, Component, HostListener, inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '../shared/confirm-delete/confirm.service';
import { AccountService } from '../entities/account.service';
import { HypotheticalService } from '../entities/hypothetical.service';
import { Hypothetical, HypotheticalAccount } from './hypothetical';
import { Account, AccountType, APR } from '../entities/account';
import { formatDate } from '@angular/common';
import { LogService } from '../entities/log.service';
import { Transaction } from '../entities/transaction';
import { Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { BudgetItemService } from '../entities/budget.service';
import { BudgetItem } from '../entities/budgetItem';

@Component({
  selector: 'app-hypothetical',
  templateUrl: './hypothetical.component.html',
  styleUrl: './hypothetical.component.scss',
  standalone: false
})
export class HypotheticalComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

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
  private budgetItemService = inject(BudgetItemService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private logService = inject(LogService);

  hypo = new Hypothetical();
  accounts = new Array<Account>();
  budgetItems = new Array<BudgetItem>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  endDateStr = formatDate(new Date(Date.now()), 'yyyy-MM-dd', 'en-US');
  endDateRangeOptions = ['', '7 days (1 week)', '30 days (1 month)', '90 days (3 months)', '180 days (6 months)', '270 days (9 months)', '360 days (12 months)'];
  endRange = '';
  stepCount = 10;

  lineChartOptions = { elements: { line: { tension: 0.5, } } };
  data: any;

  async ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    const hypo = await this.hypoService.getById(id);

    if (!hypo) {
      this.router.navigate(['/account-list']);
      return;
    }

    this.hypo = hypo as Hypothetical;
    this.accounts = await this.accountService.getAccounts();
    this.budgetItems = await this.budgetItemService.getBudgetItems();

    this.createHypoAccountPerAccount();
    this.chart?.update();
    this.cdr.markForCheck();
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
    this.startDate = date;

    date.setDate(date.getDate() + diff);
    this.endDate = date;
    this.endDateStr = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.onDateChange(date.toDateString());
  }

  onDateChange = (endDateStr: string, startDate: Date | null = null) => {
    if (startDate == null)
      startDate = new Date(Date.now());

    startDate.setHours(0, 0, 0, 0);
    this.startDate = startDate;

    if (!endDateStr)
      endDateStr = new Date(Date.now()).toDateString();

    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);

    this.endDate = endDate;
    this.calculateAccountBalance(startDate, endDate);
  }

  private calculateAccountBalance = (startDate: Date, endDate: Date) => {
    const numOfDays = this.getDateDiff(startDate, endDate);

    let segmentLength = Math.floor(numOfDays / (this.stepCount - 1));
    this.createTableXTickMarkLabels(this.stepCount, segmentLength)

    this.createHypoAccountPerAccount();

    for (let k = 0; k < this.hypo.Accounts.length; ++k) {
      const hypoAccount = this.hypo.Accounts[k];

      const account = this.accounts.find(x => x.AccountId === hypoAccount.AccountId);

      if (!account) {
        this.logService.addLog('Missing account by Id when calculating account diff in hypotheticals', 'error');
        continue;
      }

      hypoAccount.DailyBalance = new Array<number>();
      hypoAccount.Transactions = new Array<Transaction>();
      hypoAccount.DailyBalance.push(account.Balance);


      for (let i = 1; i <= numOfDays; ++i) {
        hypoAccount.DailyBalance.push(hypoAccount.DailyBalance[i - 1]);

        const currentDate = new Date(startDate.valueOf());
        currentDate.setDate(currentDate.getDate() + (i - 1));

        if (account.Type === AccountType.CreditCard) {
          // Apply interest first for previous day before any new charges today
          this.applyDailyCompoundInterest(i, account, hypoAccount, currentDate);
        }

        this.applyBudgetItemCharges(i, currentDate, hypoAccount)
      }

      if (account.Name !== 'New American Funding') {
        const data = hypoAccount.DailyBalance.filter((x, i) => i % segmentLength === 0).map(x => (x).toFixed(2));
        this.addOrUpdateChart(account.Name, data, account.BorderColor);
      }
    }
  }

  private applyBudgetItemCharges = (i: number, currentDate: Date, hypoAccount: HypotheticalAccount) => {
    for (const budgetItem of this.budgetItems) {
      if (+budgetItem.AccountId !== +hypoAccount.AccountId)
        continue;

      if (!budgetItem.StartDate) {
        // May want to let user know about this
        this.logService.addLog('applyBudgetItemCharges - Missing start date on repeatable budget item');
        continue;
      }

      if (budgetItem.IsRepeat) {
        if (budgetItem.Frequency === 'Months') {
          const monthDiff = this.monthDiff(budgetItem.StartDate, currentDate);
          if (monthDiff % +budgetItem.FrequencyNumber === 0) {
            if (budgetItem.StartDate.getDate() === currentDate.getDate()) {
              this.addTransactionFromBudgetItem(i, budgetItem, hypoAccount, currentDate);
            }
          }
        } else if (budgetItem.Frequency === 'Days') {
          const dateDiff = this.getDateDiff(budgetItem.StartDate, currentDate);
          if (dateDiff % +budgetItem.FrequencyNumber === 0) {
            this.addTransactionFromBudgetItem(i, budgetItem, hypoAccount, currentDate);
          }
        } else if (budgetItem.Frequency === 'Weeks') {
          const dateDiff = this.getDateDiff(budgetItem.StartDate, currentDate);
          if (dateDiff >= 0 && dateDiff % (+budgetItem.FrequencyNumber * 7) === 0) {
            this.addTransactionFromBudgetItem(i, budgetItem, hypoAccount, currentDate);
          }
        }
      } else if (currentDate.getFullYear() === budgetItem.StartDate.getFullYear() &&
        currentDate.getMonth() === budgetItem.StartDate.getMonth() &&
        currentDate.getDate() === budgetItem.StartDate.getDate()) {
        this.addTransactionFromBudgetItem(i, budgetItem, hypoAccount, currentDate);
      }
    }
  }

  private addTransactionFromBudgetItem = (i: number, budgetItem: BudgetItem, hypoAccount: HypotheticalAccount, currentDate: Date) => {
    const transaction = new Transaction();
    transaction.AccountId = hypoAccount.AccountId;
    transaction.Amount = budgetItem.Amount;
    transaction.Type = 'Charge';
    transaction.Category = budgetItem.Type;

    hypoAccount.Transactions.push(transaction);
    hypoAccount.DailyBalance[i] += transaction.Amount;
  }

  private applyDailyCompoundInterest = (i: number, account: Account, hypoAccount: HypotheticalAccount, currentDate: Date) => {
    if (hypoAccount.DailyBalance[i] < 0) {
      const transaction = new Transaction();
      transaction.AccountId = account.AccountId;


      /* Need to find out if there was a previous balance after last due date. If so, calculate daily compound
          interest. If not, do nothing. For now, we will assume there was a balance.
      */


      const dailyInterestRate = this.getDailyInterestRate(currentDate, account);

      transaction.Amount = hypoAccount.DailyBalance[i] * dailyInterestRate;
      transaction.Category = 'Interest';
      transaction.Description = 'Daily Accrued Interest'

      hypoAccount.DailyBalance[i] = hypoAccount.DailyBalance[i] + transaction.Amount;
    }
  };

  private createTableXTickMarkLabels = (numOfLabels: number, segmentLength: number) => {
    const labels = new Array<string>();
    let date = new Date(Date.now());

    for (let i = 0; i < numOfLabels; ++i) {
      labels.push(date.toDateString());
      date.setDate(date.getDate() + segmentLength);
    }

    this.setChart(labels);
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

    if (account.HasAPRPromo && account.APRPromo && this.withinAPRPromoRange(date, account.APRPromo.StartDate, account.APRPromo.EndDate)) {
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

  private monthDiff = (d1: Date, d2: Date): number => {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  setChart(labels: Array<string>) {
    this.data = {
      datasets: [],
      labels: labels
    };
  }

  addOrUpdateChart(lineLabel: string, data: Array<string>, borderColor: string) {
    const index = this.data.datasets.find((x: any) => x.label === lineLabel);

    if (index > -1) {
      this.data.datasets[index] = data;
    } else {
      this.data.datasets.push(
        {
          label: lineLabel,
          data: data,
          borderColor: borderColor || 'rgba(0,0,0,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        }
      );
    }
  }

  onStepCountChange = (event: Event) => {
    this.calculateAccountBalance(this.startDate as Date, this.endDate as Date);
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
