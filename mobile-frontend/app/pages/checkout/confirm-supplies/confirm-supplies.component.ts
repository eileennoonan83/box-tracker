import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { BoxService } from "../../../shared/box/box.service";
import { PaymentService } from "../../../shared/payment/payment.service";

import { BoxProfile } from "../../../shared/box/box-profile";
import { Box } from "../../../shared/box/box";


@Component({
    templateUrl: "pages/checkout/confirm-supplies/confirm-supplies.html"
})

export class ConfirmSuppliesComponent implements OnInit {

    box: BoxProfile;
    boxes: Array<Box> = [];
    total: number;   

    constructor(private boxService: BoxService, private payment: PaymentService, private router: Router) {}

    ngOnInit() {
        let box = this.boxService.getBoxProfile();

        if (this.boxService.isGetting()) {
            this.total = box.deposit;
            this.boxes = box.pickupBoxes;
        } else {
            this.total = box.refund;
            this.boxes = box.returningBoxes;
        }

        this.box = box;
    }

    confirm() {
        this.router.navigate(['/checkout.completeOrder']);
    }

    makeCorrections() {
        if (this.boxService.isGetting()) {
            this.router.navigate(["/getBoxes"]);
        }

        if (this.boxService.isReturning()) {
            this.router.navigate(["/returnBoxes"]);
        }    
    }
}
