import { Injectable, EventEmitter } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs";

var moment = require('moment');

import { BaseService } from "../base.service";
import { Box } from "../../shared/box/box";
import { BoxProfile } from "../../shared/box/box-profile";
import { AuthService, OnLogOut, OnCancel } from "../../shared/auth/auth.service";

@Injectable()
export class BoxService extends BaseService implements OnLogOut, OnCancel {

    newBoxProfileLoaded$: EventEmitter<boolean> = new EventEmitter;
    private _action: string;
    private box: BoxProfile;
    private _stored_options: Array<{}> = [];
 

    constructor(protected http: Http, protected auth: AuthService) {
        super(http);
        auth.loggedOut$.subscribe((loggedOut) => this.onLogOut(loggedOut));
        auth.cancel$.subscribe((abort) => this.onCancel(abort));
    }

    getBoxes(boxes: Array<Box>) : Observable<BoxProfile> {
        return this.saveBoxData({ 
            pickup_supplies: boxes, 
            scheduled_return_date: this.box.scheduledReturnDate 
        });
    }

    returnBoxes(boxes: Array<Box>) : Observable<BoxProfile> {
        return this.saveBoxData({ 
            returning_supplies: boxes 
        });
    }

    clearUnreturnedBoxes(box: BoxProfile) : Observable<BoxProfile> {
        let url = this.apiUrl + "/freeBox/" + this.box.id + "/clearUnreturned",
            http_options = this.options();
            console.log("Clearing unreturned", url, JSON.stringify(http_options));
        return this.http.patch(url, {}, http_options)
            .catch(this.handleErrors);
    }

    private saveBoxData(data: {}) : Observable<BoxProfile> {
        let http_options = this.options(),
            lastUrlSegment = this.isGetting() ? 'pickup' : 'return',
            url = this.apiUrl + "/freeBox/" + this.box.id + "/" + lastUrlSegment;

        this._stored_options = this.box.options;

        console.log(url, JSON.stringify(data));

        return this.http.patch(url, data, http_options)
            .map(this.handleSingleBoxSuccess)
            .catch(this.handleErrors);
    }

    handleSingleBoxSuccess(response: Response) {
        let result = response.json();

        result = BoxProfile.make(result.data);

        if (!result.options.length) {
            result.options = this._stored_options;
        }

        return result;
    }

    getting() {
        this._action = 'getting';
    }

    returning() {
        this._action = 'returning';
    }

    isGetting() {
        return this._action === 'getting';
    }

    isReturning() {
        return this._action === 'returning';
    }

    get managerRoute() {
        if (this.isGetting()) {
            return 'getBoxes';
        }
        if (this.isReturning()) {
            return 'returnBoxes';
        }
    }

    protected options() {
        return { headers: this.getHeaders(this.auth.getUser())};
    }

    onLogOut(loggedOut) {
        if (loggedOut) {
            this.clearBoxProfile();
        }
    }

    onCancel(cancel) {
        if (cancel) {
            this.clearBoxProfile();
        }
    }

    getBoxProfile() : BoxProfile {
        return this.box;
    }

    setBoxProfile(box: BoxProfile) {
        this.box = box;
        return this;
    }

    clearBoxProfile() {
        this.box = BoxProfile.make({});
    }
}
