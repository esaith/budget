import { Injectable } from "@angular/core";
import { Hypothetical } from "../hypothetical/hypothetical";
import { sortByOrder } from "./helper";

@Injectable({
    providedIn: 'root',
})
export class HypotheticalService {
    getAll = async (): Promise<Array<Hypothetical>> => {
        const result = new Array<Hypothetical>();
        const hypotheticalsStr = localStorage.getItem('hypotheticals');

        if (hypotheticalsStr) {
            const hypotheticals = JSON.parse(hypotheticalsStr) as Array<Hypothetical>;

            for (let i = 0; i < hypotheticals.length; ++i) {
                const foundHypo = await this.getById(hypotheticals[i].HypotheticalId);

                if (foundHypo) {
                    result.push(Object.assign(new Hypothetical(), foundHypo))
                }
            }

            result.sort(sortByOrder);

            for (let i = 0; i < result.length; ++i) {
                result[i].Order = i;
            }
        }

        return Promise.resolve(result);
    }

    getById = async (id: number): Promise<Hypothetical | null> => {
        const hypoStr = localStorage.getItem(`hypothetical_${id}`);

        if (hypoStr) {
            return Promise.resolve(JSON.parse(hypoStr));
        }

        return Promise.resolve(null);
    };

    save = async (hypo: Hypothetical): Promise<void> => {
        localStorage.setItem(`hypothetical_${hypo.HypotheticalId}`, JSON.stringify(hypo));

        const hypotheticals = await this.getAll();
        const found = hypotheticals.find(x => x.HypotheticalId === hypo.HypotheticalId);

        if (!found) {
            hypotheticals.push(hypo.clone())
            await this.saveMany(hypotheticals);
        }

        return Promise.resolve();
    };

    saveMany = (hypotheticals: Array<Hypothetical>): Promise<void> => {
        localStorage.setItem('hypotheticals', JSON.stringify(hypotheticals));
        return Promise.resolve();
    };

    delete = async (id: number): Promise<void> => {
        let hypotheticals = await this.getAll();
        hypotheticals = hypotheticals.filter(x => +x.HypotheticalId !== +id);
        await this.saveMany(hypotheticals);
    }
}