export enum AccountType { Unset, Checking, Saving, CreditCard, Loan }
export enum TransactionType { Unset, Charge, Deposit, Transfer }

export class Account {
    AccountId = 0;
    Name = '';
    Balance = 1;
    Type = AccountType.Unset;
    Active = true;
    Transactions = new Array<Transaction>();

    clone = (): Account => {
        const cloneAccount = new Account();
        cloneAccount.AccountId = this.AccountId;
        cloneAccount.Name = this.Name;
        cloneAccount.Type = this.Type;

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
