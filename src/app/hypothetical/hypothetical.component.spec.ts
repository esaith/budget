import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Account, AccountType, APR } from "../entities/account";
import { HypotheticalAccount } from "./hypothetical";
import { HypotheticalComponent } from "./hypothetical.component";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "../entities/account.service";
import { HypotheticalService } from "../entities/hypothetical.service";
import { ConfirmService } from "../shared/confirm-delete/confirm.service";
import { ChangeDetectorRef } from "@angular/core";
import { LogService } from "../entities/log.service";
import { BudgetItem } from "../entities/budgetItem";

describe('hypothetical component', () => {
    describe('onDateChange', () => {

        let component: HypotheticalComponent;
        let fixture: ComponentFixture<HypotheticalComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                declarations: [HypotheticalComponent],
                providers: [
                    { provide: Router, useValue: {} },
                    { provide: ActivatedRoute, useValue: { snapshot: { params: { 'id': 1 } } } },
                    { provide: AccountService, useValue: {} },
                    { provide: HypotheticalService, useValue: {} },
                    { provide: ConfirmService, useValue: {} },
                    { provide: ChangeDetectorRef, useValue: { markForCheck: () => { } } },
                    { provide: LogService, useValue: {} }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(HypotheticalComponent);
            component = fixture.componentInstance;
            // fixture.detectChanges();
        });

        it('0Account. Null start and end date. Return 0 for all accounts', () => {
            component.accounts = new Array<Account>();

            // Act
            component.onDateChange('', null);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(0);
        });

        // if end date is before start date, set end date as start date

        it('1Account. Start null. End Null. Set both start and end as today. Return 1 day of compound interest', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;

            component.accounts.push(account);

            // Act
            component.onDateChange('', null);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(2);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.27);
        });

        it('1Account. Start today. End today. Return 1 day of compound interest.', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;

            component.accounts.push(account);

            // Act
            const endDate = new Date(Date.now());
            endDate.setHours(0, 0, 0, 0);

            const startDate = new Date(endDate.valueOf())

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(2);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.27);
        });

        it('1Account. Start today. End tomorrow. Return 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;

            component.accounts.push(account);

            // Act
            const endDate = new Date(Date.now());
            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(12, 0, 0, 0);

            component.onDateChange(endDate.toDateString());

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.27);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(2)).toEqual(-1000.55);
        });

        it('1Account. 5 days of compound interest. APR Promo for 6 months and within range. Return PROMO APR', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;

            account.APRPromo = new APR();
            account.APRPromo.StartDate = new Date(2025, 1, 1, 12);
            account.APRPromo.EndDate = new Date(2025, 7, 1, 12);
            account.APRPromo.Rate = 1;
            account.HasAPRPromo = true;

            component.accounts.push(account);

            // Act
            const endDate = new Date(2025, 2, 5, 12);
            const startDate = new Date(2025, 2, 1, 12);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(6);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.03);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(2)).toEqual(-1000.05);
            expect(+component.hypo.Accounts[0].DailyBalance[3].toFixed(2)).toEqual(-1000.08);
            expect(+component.hypo.Accounts[0].DailyBalance[4].toFixed(2)).toEqual(-1000.11);
            expect(+component.hypo.Accounts[0].DailyBalance[5].toFixed(2)).toEqual(-1000.14);
        });

        it('1Account. 5 days of compound interest. APR Promo for 1 month. Starts within range. Ends outside.  Return PROMO APR', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;

            account.APRPromo = new APR();
            account.APRPromo.StartDate = new Date(2025, 2, 1);
            account.APRPromo.EndDate = new Date(2025, 2, 4);
            account.APRPromo.Rate = 1;
            account.HasAPRPromo = true;

            component.accounts.push(account);

            // Act
            const endDate = new Date(2025, 2, 5);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(6);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.03);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(2)).toEqual(-1000.05);
            expect(+component.hypo.Accounts[0].DailyBalance[3].toFixed(2)).toEqual(-1000.08);
            expect(+component.hypo.Accounts[0].DailyBalance[4].toFixed(2)).toEqual(-1000.11);
            expect(+component.hypo.Accounts[0].DailyBalance[5].toFixed(2)).toEqual(-1000.38);
        });

        it('1Account. 5 days of compound interest. APR Promo for 1 month. Ends within range. Starts outside.  Return PROMO APR', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;

            account.APRPromo = new APR();
            account.APRPromo.StartDate = new Date(2025, 2, 3);
            account.APRPromo.EndDate = new Date(2025, 2, 5);
            account.APRPromo.Rate = 1;
            account.HasAPRPromo = true;

            component.accounts.push(account);

            // Act
            const endDate = new Date(2025, 2, 5);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(6);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1000.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1000.548);
            expect(+component.hypo.Accounts[0].DailyBalance[3].toFixed(3)).toEqual(-1000.575);
            expect(+component.hypo.Accounts[0].DailyBalance[4].toFixed(3)).toEqual(-1000.603);
            expect(+component.hypo.Accounts[0].DailyBalance[5].toFixed(3)).toEqual(-1000.63);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 1/day. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Days'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2020, 2, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1027.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1054.555);
        });

        it('1Account. 1BudgetItem - IsRepeat false. Start date long gone. Repeat q 1/day. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Gym membership'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -99;
            budgetItem.Type = 'One time payment';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Days'
            budgetItem.IsRepeat = false;
            budgetItem.StartDate = new Date(2020, 2, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1000.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1000.548);
        });

        it('1Account. 1BudgetItem - IsRepeat false. Start date within range. Repeat q 1/day. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Gym membership'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -99;
            budgetItem.Type = 'One time payment';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Days'
            budgetItem.IsRepeat = false;
            budgetItem.StartDate = new Date(2025, 2, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1099.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1099.575);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 2/day. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '2';
            budgetItem.Frequency = 'Days'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2025, 1, 28);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1027.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1027.555);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 1/week. Skip. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Weeks'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2025, 1, 28);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1000.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1000.548);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 1/week. Run it. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Weeks'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2025, 1, 22);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1027.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1027.555);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 1/month. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Months'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2020, 2, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1027.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1027.555);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 3/months. Should skip. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '3';
            budgetItem.Frequency = 'Months'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2020, 0, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1000.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1000.548);
        });

        it('1Account. 1BudgetItem - IsRepeat true. Repeat q 3/months. Should run it. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '3';
            budgetItem.Frequency = 'Months'
            budgetItem.IsRepeat = true;
            budgetItem.StartDate = new Date(2020, 2, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1027.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1027.555);
        });

        it('1Account. 1BudgetItem - IsRepeat false. 2 days of compound interest.', () => {
            component.accounts = new Array<Account>();
            component.budgetItems = new Array<BudgetItem>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = -1000;
            account.Type = AccountType.CreditCard;
            component.accounts.push(account);

            const budgetItem = new BudgetItem();
            budgetItem.Name = 'Netflix'
            budgetItem.AccountId = account.AccountId;
            budgetItem.Amount = -27;
            budgetItem.Type = 'Subscriptions (Netflix, Hulu, etc)';
            budgetItem.FrequencyNumber = '1';
            budgetItem.Frequency = 'Months'
            budgetItem.IsRepeat = false;
            budgetItem.StartDate = new Date(2020, 2, 1);
            component.budgetItems.push(budgetItem);

            // Act
            const endDate = new Date(2025, 2, 2);
            const startDate = new Date(2025, 2, 1);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(3);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(3)).toEqual(-1000.274);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(3)).toEqual(-1000.548);
        });
    });
});
