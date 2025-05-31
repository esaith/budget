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

    BorderColor = '';
    todaysAPR = '';

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

    generateTodaysAPR() {
        if (!this.APR) {
            this.todaysAPR = '';
            return;
        }

        const today = new Date(Date.now());
        today.setHours(1, 0, 0);

        if (this.HasAPRPromo && this.APRPromo) {
            const startDate = new Date(this.APRPromo.StartDate);
            startDate.setHours(0, 0, 0)
            const endDate = new Date(this.APRPromo.EndDate);
            endDate.setHours(11, 0, 0);

            if (startDate <= today && today <= endDate) {
                this.todaysAPR = this.APRPromo.Rate.toString();
                return;
            }
        }

        this.todaysAPR = this.APR.toString();
    }
}

export class APR {
    StartDate = new Date();
    EndDate = new Date();
    Rate = 0;
}
