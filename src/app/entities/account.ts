export enum AccountType { Unset, Checking, Saving, CreditCard, Loan }
export enum TransactionType { Unset, Charge, Deposit, Transfer }

export class Account {
    AccountId = 0;
    Name = '';
    Type = AccountType.Unset;
    Transactions = new Array<Transaction>()
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
