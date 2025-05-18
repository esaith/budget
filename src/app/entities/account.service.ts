import { Injectable } from "@angular/core";
import { Account } from "./account";
import { sortByOrder } from "./helper";

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

    getAccounts = async (): Promise<Array<Account>> => {
        const accountStr = localStorage.getItem('accounts');
        if (accountStr) {
            const accounts = JSON.parse(accountStr) as Array<Account>;

            accounts.sort(sortByOrder);

            for (let i = 0; i < accounts.length; ++i) {
                accounts[i].Order = i;

                const foundAccount = await this.getAccountById(accounts[i].AccountId);
                if (foundAccount) {
                    accounts[i] = foundAccount;
                }
            }

            return accounts;
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
            account.IsActive = false;
            await this.saveAccount(account);
        }
    }
}
