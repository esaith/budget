import { Injectable } from "@angular/core";
import { Account } from "./account";
import { sortByOrder } from "./helper";

@Injectable({
    providedIn: 'root',
})
export class LogService {
    private logs = new Array<Log>();

    addLog = (message = '', logLevel = 'info') => {
        this.logs.push(new Log(message, logLevel));
    }

    getLogs = (): Array<Log> => {
        return this.logs;
    }
}

class Log {
    message = '';
    logLevel = '';

    constructor(message = '', logLevel = '') {
        this.message = message;
        this.logLevel = logLevel;

        if (logLevel === 'error') {
            console.error(this.message);
        }
    }
}