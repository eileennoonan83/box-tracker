import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";

var _ = require('lodash');
var creditcardutils = require('creditcardutils');
import { LoadingIndicator } from "nativescript-loading-indicator";

import { BoxService } from "../../../shared/box/box.service";
import { PaymentService } from "../../../shared/payment/payment.service";
import { ErrorDisplayer } from "../../../shared/util/error-displayer";

import { BoxProfile } from "../../../shared/box/box-profile";
import { CreditCard } from "../../../shared/payment/credit-card/credit-card";
import { Customer } from "../../../shared/customer/customer";
import { BillingAddress } from "../../../shared/payment/credit-card/billing-address";

@Component({
    templateUrl: "pages/payment/new-credit-card/new-credit-card.html"
})

export class NewCreditCardComponent {

    card: CreditCard;
    months: [1,2,3,4,5,6,7,8,9,10,11,12];
    years: [16,17,18,19,20,21,22,23,24,25,26,27];
    rows: string;
    cardTypes: Array<string> = ['Visa', 'Mastercard', 'American Express', 'Discover'];
    box: BoxProfile;
    customer: Customer;
    indicator: LoadingIndicator;

    public expiresDisplay: string;
    public cardNumberDisplay: string;

    constructor(
        private router: Router, 
        private boxService: BoxService, 
        private paymentService: PaymentService) {
            this.indicator = new LoadingIndicator;
        }

    ngOnInit() {
        this.rows = Array(25).join("auto,");
        this.box = this.boxService.getBoxProfile();
        this.customer = this.box.customer;

        this.card = CreditCard.make({
            cardholder_name: this.customer.fullName,
            billing: {
                name: this.customer.fullName,
                address: this.customer.billingAddress.address,
                city: this.customer.billingAddress.city,
                state: this.customer.billingAddress.state,
                zip: this.customer.billingAddress.zip,
                country: this.customer.billingAddress.country
            }
        });
    }

    clearBillingInfo() {
        this.card.billing = BillingAddress.make({});
    }

    cardNumberChange(event) {
        this.card.cardNumber = event;
        this.cardNumberDisplay = creditcardutils.formatCardNumber(event);
    }

    onSubmit() {
        let cust = this.box.customer,
            card = _.cloneDeep(this.card);

        this.indicator.show({message: "Storing card ..."});
        card.type = this.cardTypes[this.card.type];

        this.paymentService
            .addCardToCustomer(card, cust)
            .subscribe(
                (card: CreditCard) => this.storeSuccess(card),
                this.storeFail
            );  
    }

    protected storeSuccess(card: CreditCard) {
        let box = this.boxService.getBoxProfile();
        box.customer.cards.push(card);
        this.boxService.setBoxProfile(box);
        this.paymentService.activeCard = card;
        this.indicator.hide();
        this.router.navigate(["/checkout.confirmSupplies"]);
    }

    protected storeFail(err: Response) {
        this.indicator.hide();
        ErrorDisplayer.alert(err);
    }

    expiresChange(event) {

        if (!event) {
            this.expiresDisplay = "";
            this.card.expirationDate = "";
            return this.expiresDisplay;
        }
        this.card.expirationDate = event.replace(/\D/g, '').substring(0,4);

        if (this.card.expirationDate.length === 0) {
            this.expiresDisplay = "";
            return this.expiresDisplay;
        }

        this.expiresDisplay = this.card.expirationDate.substring(0,2);

        if (this.card.expirationDate.length === 2) {
            this.expiresDisplay += " / ";
        }
        
        if (this.card.expirationDate.length > 2) {
            this.expiresDisplay += " / " + this.card.expirationDate.substring(2,4);
        }

        this.card.expirationMonth = this.card.expirationDate.substr(0,2);
        this.card.expirationYear = this.card.expirationDate.substr(2,4);
    
        return this.expiresDisplay;
    }
}
