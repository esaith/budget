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

        it('1Account. Null start and end date. Return 0 for all accounts', () => {
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
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
        });

        it('1Account. Start today and tomorrow. Return valid APR', () => {
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
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(2);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.27);
        });

        it('1Account. 4 days of compound interest. APR Promo for 6 months and within range.  Return PROMO APR', () => {
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

            component.accounts.push(account);

            // Act
            const endDate = new Date(2025, 2, 5, 12);
            const startDate = new Date(2025, 2, 1, 12);

            component.onDateChange(endDate.toDateString(), startDate);

            // Assert
            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(5);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(-1000);
            expect(+component.hypo.Accounts[0].DailyBalance[1].toFixed(2)).toEqual(-1000.03);
            expect(+component.hypo.Accounts[0].DailyBalance[2].toFixed(2)).toEqual(-1000.05);
            expect(+component.hypo.Accounts[0].DailyBalance[3].toFixed(2)).toEqual(-1000.08);
            expect(+component.hypo.Accounts[0].DailyBalance[4].toFixed(2)).toEqual(-1000.11);
        });
    });
});
