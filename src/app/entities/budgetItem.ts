export class BudgetItem {
    BudgetItemId = 0;
    Name = '';
    Amount = 0;
    Order = 0;
    Type = '';
    StartDate = new Date();
    EndDate = new Date();

    IsRepeat = false;
    FrequencyNumber = '';
    Frequency = '';


    clone = (): BudgetItem => {
        const result = new BudgetItem();
        result.BudgetItemId = this.BudgetItemId;
        result.Name = this.Name;
        result.Amount = this.Amount;
        result.FrequencyNumber = this.FrequencyNumber;
        result.Frequency = this.Frequency;
        result.StartDate = this.StartDate;
        result.EndDate = this.EndDate;
        result.Type = this.Type;
        result.Order = this.Order;

        return result;
    }
}