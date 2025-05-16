import { Injectable } from "@angular/core";
import { Account } from "./entities/account";

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    saveAccounts(accounts: Array<Account>): Promise<void> {
        localStorage.setItem('accounts', JSON.stringify(accounts));
        return Promise.resolve();
    }

    getAccounts(): Promise<Array<Account>> {
        const accountStr = localStorage.getItem('accounts');
        if (accountStr) {
            return JSON.parse(accountStr);
        }

        return Promise.resolve(new Array<Account>());
    }
}