import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { Config } from "./config";
import { User } from "./user/user";
var base64 = require('base-64');

export class BaseService {

    protected apiUrl: string;

    constructor(protected http: Http) {
        this.apiUrl = Config.apiUrl;
    }

    protected getHeaders = function(user: User) {
        let authHeaders = this.getAuthHeader(user),
            headers = new Headers(authHeaders);

        headers.append("Content-Type", "application/json");

        return headers;
    }

    protected getAuthHeader(user: User) : Headers {
        let authValue = this.getAuthHeaderValue(user),
            authHeader = new Headers();

        authHeader.append("Authorization", authValue);
        return authHeader;
    }

    protected getAuthHeaderValue(user: User) : string {
        let emailPassStr = user.email + ":" + user.password,
            credentialHash = base64.encode(emailPassStr),
            authValue = "Basic " + credentialHash;

        return authValue;
    }

    protected handleErrors = function(error: Response) {
        // console.log(JSON.stringify(error));
        return Observable.throw(error);
    }
}
