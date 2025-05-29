import { generateUniqueId } from "./helper";

export class Transaction {
    TransactionId = generateUniqueId();
    Type = ''; // Charge | Deposit | Transfer To | Transfer From
    Amount = 0;
    Category = '';
    Description = '';
    Location = '';
    AccountId: number | null = null;
    TransferTo: number | null = null;
}