import { Injectable } from "@angular/core";
import { Account } from "./account";
import { sortByOrder } from "./helper";

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    saveMany = (accounts: Array<Account>): Promise<void> => {
        localStorage.setItem('accounts', JSON.stringify(accounts));
        return Promise.resolve();
    };

    save = async (account: Account): Promise<void> => {
        localStorage.setItem(`account_${account.AccountId}`, JSON.stringify(account));

        const accounts = await this.getAccounts();
        const found = accounts.find(x => x.AccountId === account.AccountId);
        if (!found) {
            accounts.push(account.clone())
            await this.saveMany(accounts);
        }

        return Promise.resolve();
    };

    getAccounts = async (): Promise<Array<Account>> => {
        const result = new Array<Account>();
        const accountStr = localStorage.getItem('accounts');

        if (accountStr) {
            const accounts = JSON.parse(accountStr) as Array<Account>;

            for (let i = 0; i < accounts.length; ++i) {
                const foundAccount = await this.getAccountById(accounts[i].AccountId);

                if (foundAccount) {
                    result.push(Object.assign(new Account(), foundAccount))
                }
            }

            result.sort(sortByOrder);

            for (let i = 0; i < result.length; ++i) {
                result[i].Order = i;

                if (result[i].APRPromo) {
                    if (result[i].APRPromo.StartDate)
                        result[i].APRPromo.StartDate = new Date(result[i].APRPromo.StartDate);

                    if (result[i].APRPromo.EndDate)
                        result[i].APRPromo.EndDate = new Date(result[i].APRPromo.EndDate);
                }
            }
        }

        return Promise.resolve(result);
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
            await this.save(account);
        }
    }
}
