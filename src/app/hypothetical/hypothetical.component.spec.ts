import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Account, AccountType } from "../entities/account";
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


        it('1Account. Null start and end date. Return 0 for all accounts', () => {
            component.accounts = new Array<Account>();

            const account = new Account();
            account.Name = 'Test';
            account.APR = 10;
            account.Balance = 1000;
            account.Type = AccountType.CreditCard;

            component.accounts.push(account);

            // Act
            component.onDateChange('', null);

            expect(component.hypo.Accounts.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance.length).toEqual(1);
            expect(component.hypo.Accounts[0].DailyBalance[0]).toEqual(1000);
        });
    });
});
