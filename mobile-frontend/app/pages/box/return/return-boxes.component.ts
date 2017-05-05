import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";

import dialogs = require("ui/dialogs");
import { LoadingIndicator } from "nativescript-loading-indicator";
declare var MBProgressHUDModeCustomView;

import { AuthService } from "../../../shared/auth/auth.service";
import { BoxService } from "../../../shared/box/box.service";
import { ErrorDisplayer } from "../../../shared/util/error-displayer";

import { BoxProfile } from "../../../shared/box/box-profile";
import { Box } from "../../../shared/box/box";

var _ = require('lodash');

@Component({
    templateUrl: "pages/box/return/return-boxes.html"
})

export class ReturnBoxesComponent {

    box: BoxProfile;
    loading: boolean = false;
    boxes: Array<Box> = [];
    refund: number = 0;
    filterEmpty: boolean = true;
    indicator: LoadingIndicator;

    constructor(protected boxService: BoxService, protected router: Router, protected auth: AuthService) {
        this.indicator = new LoadingIndicator;
    }

    ngOnInit() {
        let box = this.boxService.getBoxProfile();

        if (box.returningBoxes.length > 0) {
            this.boxes = box.returningBoxes;
            this.filterEmpty = false;
        } else {
            this.boxes = box.outBoxes.filter((item : Box) => item.refundable);
        }
        this.box = box;
    }

    onBoxesChange(val) {
        this.boxes = val;
    }

    onTotalChange(val) {
        this.refund = val;
    }

    checkout() {

        if (this.boxes.length === 0) {
            dialogs.alert("Can't checkout! No boxes have been selected!\n\n Click \"Forfeit Refund\" if the customer will not be returning any of the boxes.").then(() => {});
            return;
        }
        this.box.returningBoxes = this.boxes;
        this.box.refund = this.refund;
        this.boxService.setBoxProfile(this.box);
        this.router.navigate(["/payment.paymentMethodSelect"]);
    }

    forfeitRefund() {
        dialogs.confirm({
            title: "Confirm Refund Forfeit",
            message: "Forfeiting the refund will clear the customer's returnable boxes from the system, and they will not be able to get a refund. This is irreversible. \n\nAre you sure?",
            okButtonText: "Yes",
            cancelButtonText: "No"
        }).then((confirmed) => {
            if (confirmed) {
                this.indicator.show({message: "Clearing unreturned boxes ..."});
                this.boxService
                    .clearUnreturnedBoxes(this.box)
                    .subscribe(
                        () => this._completeForfeiture(),
                        (err: Response) => {
                            this.indicator.hide();
                            ErrorDisplayer.alert(err);
                        }
                    );
            }
        });
    }

    private _navigateToCheckout(box: BoxProfile) {
        this.router.navigate(["/payment.paymentMethodSelect"]);
    }

    private _completeForfeiture(){
        this.indicator.hide();
        this.indicator.show({ message: "Complete!", ios: {mode: MBProgressHUDModeCustomView, customView: 'Checkmark.png'}});
        setTimeout(() => {
            this.indicator.hide();
            this.auth.reset();
        }, 2000)
    }
}
