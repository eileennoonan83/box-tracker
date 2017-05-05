import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";

import { BaseService } from "../base.service";
import { AuthService, OnLogOut, OnCancel } from "../../shared/auth/auth.service";

import { CreditCard } from "../../shared/payment/credit-card/credit-card";
import { BillingAddress } from "../../shared/payment/credit-card/billing-address";
import { Charge } from "../../shared/payment/credit-card/charge";
import { Customer } from "../../shared/customer/customer";
import { BoxProfile } from "../../shared/box/box-profile";

@Injectable()
export class PaymentService extends BaseService implements OnLogOut, OnCancel {

    activeCard?: CreditCard;
    private _paymentMethod: string = '';

    static CreditCardPaymentMethod: string = 'creditCard';
    static CashPaymentMethod: string = 'cash';

    constructor(protected http: Http, protected auth: AuthService) {
        super(http);
        auth.loggedOut$.subscribe((loggedOut) => this.onLogOut(loggedOut));
        auth.cancel$.subscribe((reset) => this.onCancel(reset));
    }

    addCardToCustomer(card: CreditCard, customer: Customer) : Observable<CreditCard> {
        let url = this.apiUrl + "/customer/" + customer.id + "/creditCard",
            data = { card: card },
            options = { headers: this.getHeaders(this.auth.getUser()) };
            
        return this.http.post(url, data, options)
            .map((res: Response) => {
                let data = res.json(),
                    card = CreditCard.make(data.card);
                console.log(JSON.stringify(data));
                return card;
            })
            .catch(this.handleErrors);
    }

    issueRefund(charge: Charge, box: BoxProfile) : Observable<Response>{
        if(this._paymentMethod.length === 0) {
            throw Error ('Must set payment method before using payment service issueRefund method');
        }
        if (this._paymentMethod === PaymentService.CashPaymentMethod) {
            return this.cashRefund(charge, box);
        } else if (this._paymentMethod === PaymentService.CreditCardPaymentMethod) {
            return this.creditCardRefund(charge, box);
        }
    }

    chargeDeposit(charge: Charge, box: BoxProfile) : Observable<Response>{
        if(this._paymentMethod.length === 0) {
            throw Error ('Must set payment method before using payment service chargeDeposit method');
        }
        if (this._paymentMethod === PaymentService.CashPaymentMethod) {
            return this.cashDeposit(charge, box);
        } else if (this._paymentMethod === PaymentService.CreditCardPaymentMethod) {
            return this.creditCardDeposit(charge, box);
        }
    }

    creditCardDeposit(charge: Charge, box: BoxProfile) : Observable<Response> {
        return this._runCreditCardTransaction(charge, box, 'deposit');
    }

    creditCardRefund(charge: Charge, box: BoxProfile) : Observable<Response> {
        return this._runCreditCardTransaction(charge, box, 'refund');
    }

    private _runCreditCardTransaction(charge: Charge, box: BoxProfile, transactionType) : Observable<Response>  {
        let url = this.apiUrl + "/freeBox/" + box.id + "/" + transactionType + "/creditCard/" + charge.card.id;
        return this._runTransaction(charge, url);
    }

    cashDeposit(charge: Charge, box: BoxProfile) : Observable<Response> {
        return this._runCashTransaction(charge, box, 'deposit');
    }

    cashRefund(charge: Charge, box: BoxProfile) : Observable<Response> {
        return this._runCashTransaction(charge, box, 'refund');
    }

    private _runCashTransaction(charge: Charge, box: BoxProfile, transactionType) : Observable<Response> {
        let url =  this.apiUrl + "/freeBox/"+ box.id + "/" + transactionType + "/cash";
        return this._runTransaction(charge, url);
    }

    private _runTransaction(charge: Charge, url) {

        let options = { headers: this.getHeaders(this.auth.getUser()) },
            data = {
                amount: charge.amount,
                description: charge.description,
                signature: charge.signature.base64
            };

        [url, options, data].map(el => console.log(JSON.stringify(el)));
            
        return this.http.post(url, data, options)
            .catch(this.handleErrors)
    }

    getCustomerLikelyBillingAddress(customer: Customer) : Observable<BillingAddress> {
        let url = this.apiUrl + "/customer/" + customer.id + "/creditCard/likelyBillingAddress",
            options = { headers: this.getHeaders(this.auth.getUser()) };
            console.log(url);
        return this.http.get(url, options)
            .map((res: Response) => {
                let data = res.json(),
                    billingAddress = BillingAddress.make(data.billingAddress);

                return billingAddress;
            })
            .catch(this.handleErrors);
    }

    clearActiveCard() {
        this.activeCard = CreditCard.make({});
    }

    onLogOut(loggedOut) {
        if (loggedOut) {
            this.clearActiveCard();
        }
    }

    onCancel(cancel) {
        if (cancel) {
            this.clearActiveCard();
        }
    }

    set paymentMethod(method: string) {
        if (method !== PaymentService.CashPaymentMethod && method !== PaymentService.CreditCardPaymentMethod) {
            throw Error("Payment method must be either creditCard or cash. Received "+JSON.stringify(method));
        }
        this._paymentMethod = method;
    }

    get paymentMethod() {
        return this._paymentMethod;
    }
}
