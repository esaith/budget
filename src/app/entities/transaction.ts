import { generateUniqueId } from "./helper";

export class Transaction {
    TransactionId = generateUniqueId();
    Type = '';
    Amount = 0;
    Category = '';
    Desciption = '';
    Location = '';
    AccountId: number | null = null;
    TransferTo: number | null = null;
}