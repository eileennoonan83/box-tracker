import { CreditCard } from "./credit-card";
import { ChargeDescription } from "./charge-description";
import { Signature } from "./signature";

var _ = require("lodash");

export class Charge {

    amount: number;
    card: CreditCard;
    private _status: string = 'pending';
    errors: Array<string> = [];
    description: ChargeDescription;
    signature: Signature;

    static make(data) {
        let charge = new Charge;

        charge.amount = data.amount;
        
        if(_.has(data, 'card')) {
            charge.card = CreditCard.make(data.card);
        }

        if (_.has(data, 'status') && data.status.length > 0) {
            charge.status = data.status;
        }

        if (_.has(data, 'errors')) {
            charge.errors = data.errors;
        }

        if (_.has(data, 'description')) {
            charge.description = ChargeDescription.make(data.description);
        }

        if (_.has(data, 'signature')) {
            charge.signature = Signature.make(data.signature);
        }

        return charge;
    }

    set status(status: string) {
        if (!/pending|succeeded|failed/g.test(status)) {
            throw Error ('Charge status must be "pending", "succeeded", or "failed". Got ' + status);
        }

        this._status = status;
    }

    hasErrors() {
        return this.errors.length > 0;
    }
}
