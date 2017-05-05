import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";

import dialogs = require("ui/dialogs");

import { BoxService } from "../../../shared/box/box.service";
import { PaymentService } from "../../../shared/payment/payment.service";

import { BoxProfile } from "../../../shared/box/box-profile";
import { CreditCard } from "../../../shared/payment/credit-card/credit-card";
import { BillingAddress } from "../../../shared/payment/credit-card/billing-address";

@Component({
    templateUrl: "pages/payment/payment-method-select/payment-method-select.html"
})

export class PaymentMethodSelectComponent implements OnInit {

    box: BoxProfile;

    constructor(
        private boxService: BoxService, 
        private paymentService: PaymentService, 
        private router: Router
    ){}

    ngOnInit() {
        this.box = this.boxService.getBoxProfile();
    }

    selectCard(index : number) {
        let card = this.box.customer.cards[index],
            confMessage = 
            'Are you sure that the '
            + card.type + 
            ' card in the name of '
            + card.cardHolderName + 
            ', expiring on ' 
            + card.expirationDate +
            ' is the right card?';
        
        dialogs.confirm(confMessage).then((result) => {
            if (result) {
                this.paymentService.paymentMethod = PaymentService.CreditCardPaymentMethod;
                this.paymentService.activeCard = card;
                this.router.navigate(["/checkout.confirmSupplies"]);
            }
        });
    }

    newCard() {
        this.paymentService.paymentMethod = PaymentService.CreditCardPaymentMethod;
        this.paymentService
            .getCustomerLikelyBillingAddress(this.box.customer)
            .subscribe(
                (billingAddress: BillingAddress) => {
                    let box = this.box;
                    box.customer.billingAddress = billingAddress;
                    this.boxService.setBoxProfile(box);
                    console.log(JSON.stringify(box));
                    this.router.navigate(["/payment.newCreditCard"]);                 },
                (err: Response) => {
                    console.log(JSON.stringify("ERROR"), JSON.stringify(err));

                    this.router.navigate(["/payment.newCreditCard"]); 
                }
            )
    }

    payWithCash() {
        this.paymentService.paymentMethod = PaymentService.CashPaymentMethod;
        this.router.navigate(["/checkout.confirmSupplies"]);
    }
}
