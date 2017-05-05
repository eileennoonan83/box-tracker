import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";

import scrollViewModule = require("ui/scroll-view");
import activityIndicatorModule = require("ui/activity-indicator");
import dialogs = require("ui/dialogs");
import { DatePicker } from "ui/date-picker";

var moment = require("moment");
var _ = require("lodash");

import { BoxService } from "../../../shared/box/box.service";
import { ErrorDisplayer as e } from "../../../shared/util/error-displayer";

import { BoxProfile } from "../../../shared/box/box-profile";
import { Box } from "../../../shared/box/box";

@Component({
    templateUrl: "pages/box/get/get-boxes.html"
})

export class GetBoxesComponent implements OnInit {

    loading: boolean = false;
    box: BoxProfile;
    boxes: Array<Box>;
    total: number = 0;

    minReturnDate: Date = moment().add(1, "days").toDate();
    maxReturnDate: Date = moment().add(1, "years").toDate();

    constructor(protected boxService: BoxService, protected router: Router) {}

    ngOnInit() {
        this.box = this.boxService.getBoxProfile();

        if(!this.box.scheduledReturnDate) {
            this.box.scheduledReturnDateObject = moment().add(1, "months").toDate();
        }

        if (this.box.pickupBoxes.length > 0) {
            this.boxes = this.box.pickupBoxes;
        }
    }

    onTotalChange(val) {
        this.total = val;
    }

    onBoxesChange(val) {
        this.boxes = val;
    }

    checkout() {

        if (this.boxes.length === 0) {
            dialogs.alert("Can't checkout! No boxes have been selected!").then(() => {});
            return;
        }
        this.box.pickupBoxes = this.boxes;
        this.box.deposit = this.total;
        this.boxService.setBoxProfile(this.box);
        this.router.navigate(["/payment.paymentMethodSelect"]);

        // this.loading = true;
        // this.boxService
        //     .setBoxProfile(this.box)
        //     .getBoxes(this.boxes)
        //     .subscribe(
        //         (box: BoxProfile) => {
        //             this.loading = false;
        //             box.pickupBoxes = this.boxes;
        //             box.deposit = this.total;
        //             this.boxService.setBoxProfile(box);
        //             this.router.navigate(["/payment.paymentMethodSelect"]);
        //         },
        //         (err: Response) => {
        //             this.loading = false;
        //             e.alert(err)
        //         }
        //     );
    }
}
