export enum AccountType { Unset, Checking, Saving, CreditCard, Loan }
export enum TransactionType { Unset, Charge, Deposit, Transfer }

export class Account {
    AccountId = 0;
    Name = '';
    Balance = 0;
    Type = AccountType.Unset;
    IsActive = true;
    Order = -1;
    Transactions = new Array<Transaction>();

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

export class Transaction {
    TransactionId = 0;
    Type = TransactionType.Unset;
    Amount = 0;
    Category = '';
    Desciption = '';
    Location = '';
    AccountId: number | null = null;
    TransferTo: number | null = null;
}
