import { Injectable } from "@angular/core";
import { BudgetItem } from "./budgetItem";
import { sortByOrder } from "./helper";

@Injectable({
    providedIn: 'root',
})
export class BudgetItemService {
    saveMany = (budgetItems: Array<BudgetItem>): Promise<void> => {
        localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
        return Promise.resolve();
    };

    save = async (budgetItem: BudgetItem): Promise<void> => {
        localStorage.setItem(`budgetItem_${budgetItem.BudgetItemId}`, JSON.stringify(budgetItem));

        const budgetItems = await this.getBudgetItems();
        const found = budgetItems.find(x => x.BudgetItemId === budgetItem.BudgetItemId);
        if (!found) {
            budgetItems.push(budgetItem.clone())
            await this.saveMany(budgetItems);
        }

        return Promise.resolve();
    };

    getBudgetItems = async (): Promise<Array<BudgetItem>> => {
        const budgetItemStr = localStorage.getItem('budgetItems');

        if (budgetItemStr) {
            const budgetItems = JSON.parse(budgetItemStr) as Array<BudgetItem>;

            budgetItems.sort(sortByOrder);

            for (let i = 0; i < budgetItems.length; ++i) {
                budgetItems[i].Order = i;

                const foundBudgetItem = await this.getById(budgetItems[i].BudgetItemId);
                if (foundBudgetItem) {
                    budgetItems[i] = foundBudgetItem;
                }
            }

            return budgetItems;
        }

        return Promise.resolve(new Array<BudgetItem>());
    };

    getById = async (budgetItemId: number): Promise<BudgetItem | null> => {
        const budgetItemStr = localStorage.getItem(`budgetItem_${budgetItemId}`);

        if (budgetItemStr) {
            const budgetItem: BudgetItem = Object.assign(new BudgetItem(), JSON.parse(budgetItemStr));

            if (budgetItem.StartDate && typeof budgetItem.StartDate === 'string') {
                budgetItem.StartDate = new Date(budgetItem.StartDate);
            }

            budgetItem.AccountId = +budgetItem.AccountId;
            return Promise.resolve(budgetItem);
        }

        return Promise.resolve(null);
    };

    delete = async (budgetItemId: number): Promise<void> => {
        let budgetItems = await this.getBudgetItems();
        budgetItems = budgetItems.filter(x => +x.BudgetItemId !== +budgetItemId);
        await this.saveMany(budgetItems);
    }

    getBudgetItemTypes = async (): Promise<Array<string>> => {
        const result = new Array<string>();
        result.push('');
        result.push('Income');
        result.push('Mortgage');
        result.push('Rent');
        result.push('Home Repairs');
        result.push('Utilities');
        result.push('Vehicle');
        result.push('Insurance');
        result.push('Food');
        result.push('Phone');
        result.push('Pets');
        result.push('Subscriptions (Netflix, Hulu, etc)');
        result.push('Entertainment');
        result.push('Travel');

        return result;
    }
}