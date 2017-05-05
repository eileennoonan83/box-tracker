import { Injectable } from "@angular/core";

import { Config } from "../config";
import { PaymentService } from "./payment.service";
import { BoxService } from "../box/box.service";

@Injectable()
export class PaymentTermsService {

    private _terms? : string;

    constructor(private payment: PaymentService, private boxService: BoxService) {}

    get terms() : string {
        let terms = '',
            paymentMethod = this.payment.paymentMethod,
            isGetting = this.boxService.isGetting();

        if (isGetting) {
            if (paymentMethod === PaymentService.CreditCardPaymentMethod) {
                return Config.gettingTerms;
            }

            if (paymentMethod === PaymentService.CashPaymentMethod) {
                return Config.gettingTerms + " " + Config.gettingTermsCashAddendum
            }

        }

        return Config.returningTerms;
    }
}
