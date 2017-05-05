import { Injectable, EventEmitter } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";

import { Observable } from "rxjs/Rx";
import { RouterExtensions } from "nativescript-angular/router";

import dialogs = require("ui/dialogs");

import { BaseService } from "../base.service"
import { User } from "../user/user";

@Injectable()
export class AuthService extends BaseService {

    private user: User;
    public loggedOut$: EventEmitter<boolean> = new EventEmitter;
    public cancel$: EventEmitter<boolean> = new EventEmitter;

    constructor(protected http: Http, protected router: RouterExtensions) {
        super(http);
    }

    login(user: User) : Observable<Response> {
        let url = this.apiUrl + "/auth";
        return this.http.post(
            url,
            {},
            { headers: this.getHeaders(user) }
        )
        .map((response: Response) => {
            this.user = User.make(response.json());
            this.user.password = user.password;
            return response;
        })
        .catch(this.handleErrors);
    }


    logout() {
        dialogs.confirm('Are you sure you want to log out?').then((confirm) => {
            if (confirm) {
                this.user = User.make({});
                this.loggedOut$.emit(true);
                this.cancel$.emit(true);
                this.router.navigate(['/'], { clearHistory: true });
            }
        });
    }

    reset() {
        this._doReset();
    }

    cancel() {
        dialogs.confirm('Are you sure you want to cancel?').then((confirm) => {
            if (confirm) {
                this._doReset();
            }
        });
    }

    private _doReset() {
        this.cancel$.emit(true);
        this.router.navigate(['/lookup'], { clearHistory: true });
    }

    getUser() : User {
        return this.user ? this.user : new User();
    }
}

export declare abstract class OnLogOut {
    abstract onLogOut(loggedOut): void;
}

export declare abstract class OnCancel {
    abstract onCancel(cancel): void;
}
