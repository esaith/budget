import { generateUniqueId } from "../entities/helper";
import { Transaction } from "../entities/transaction";

export class Hypothetical {
    HypotheticalId = generateUniqueId();
    Name = '';
    Order = 0;
    Accounts = new Array<HypotheticalAccount>();

    clone = (): Hypothetical => {
        const clone = new Hypothetical();
        clone.HypotheticalId = this.HypotheticalId;
        clone.Name = this.Name;
        clone.Order = this.Order;
        clone.Accounts = this.Accounts;

        return clone;
    }
}

export class HypotheticalAccount {
    HypotheticalAccountId = generateUniqueId();
    AccountId = 0;
    Transactions = new Array<Transaction>();
    DailyBalance = new Array<number>();

}