import { inject, Injectable } from "@angular/core";
import { ConfirmDeleteComponent } from "./confirm-delete.component";
import { lastValueFrom, Subject } from "rxjs";

@Injectable({
    providedIn: 'root',

})
export class ConfirmService {
    confirm$ = new Subject<ConfirmationData>();
    confirmed$ = new Subject<boolean>();

    open(message: string): Promise<boolean> {
        const data = new ConfirmationData();
        data.message = message;
        this.confirm$.next(data);

        return new Promise((resolve, reject) => {
            const sub = this.confirmed$.subscribe({
                next: (confirmed) => {
                    resolve(confirmed)
                },
                error: (e) => {
                    console.log('Error within confirmation service message', e);
                    reject();
                }
            })
        })
    }
}

export class ConfirmationData {
    title = '';
    message = '';
}
