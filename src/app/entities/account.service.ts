import { Injectable } from "@angular/core";
import { Account } from "./account";

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    saveAccounts = (accounts: Array<Account>): Promise<void> => {
        localStorage.setItem('accounts', JSON.stringify(accounts));
        return Promise.resolve();
    };

    saveAccount = async (account: Account): Promise<void> => {
        localStorage.setItem(`account_${account.AccountId}`, JSON.stringify(account));

        const accounts = await this.getAccounts();
        const found = accounts.find(x => x.AccountId === account.AccountId);
        if (!found) {
            accounts.push(account.clone())
            await this.saveAccounts(accounts);
        }

        return Promise.resolve();
    };

    getAccounts = (): Promise<Array<Account>> => {
        const accountStr = localStorage.getItem('accounts');
        if (accountStr) {
            return JSON.parse(accountStr);
        }

        return Promise.resolve(new Array<Account>());
    };

    getAccountById = async (accountId: number): Promise<Account | null> => {
        const accountStr = localStorage.getItem(`account_${accountId}`);

        if (accountStr) {
            return Promise.resolve(JSON.parse(accountStr));
        }

        return Promise.resolve(null);
    };

    deactivate = async (accountId: number): Promise<void> => {
        const account = await this.getAccountById(accountId);

        if (account) {
            account.Active = false;
            await this.saveAccount(account);
        }
    }
}