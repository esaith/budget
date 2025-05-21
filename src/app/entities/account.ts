import { generateUniqueId } from "./helper";
import { Transaction } from "./transaction";

export enum AccountType { Unset, Checking, Saving, CreditCard, Loan }

export class Account {
    AccountId = generateUniqueId();
    Name = '';
    Balance = 0;
    Type = AccountType.Unset;
    IsActive = true;
    Order = -1;
    Transactions = new Array<Transaction>();
    APR = 0;

    HasAPRPromo = false;
    APRPromo = new APR();

    clone = (): Account => {
        const cloneAccount = new Account();
        cloneAccount.AccountId = this.AccountId;
        cloneAccount.Name = this.Name;
        cloneAccount.Type = this.Type;
        cloneAccount.Balance = this.Balance;
        cloneAccount.IsActive = this.IsActive;
        cloneAccount.Order = this.Order;

        return cloneAccount;
    }
}

export class APR {
    StartDate = new Date();
    EndDate = new Date();
    Rate = 0;
}
