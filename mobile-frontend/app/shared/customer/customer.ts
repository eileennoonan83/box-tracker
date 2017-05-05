import { CreditCard } from "../payment/credit-card/credit-card";
import { BillingAddress } from "../payment/credit-card/billing-address";
var _ = require('lodash');

export class Customer {

    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    cards: Array<CreditCard> = [];
    billingAddress: BillingAddress = BillingAddress.make({});
    freeBoxId: number;

    get fullName() {
        return this.firstName + " " + this.lastName;
    }

    public static make = function(data) {
        let customer = new Customer;

        customer.id = data.id;        
        customer.firstName = data.firstName;
        customer.lastName = data.lastName;
        customer.phone = data.phone;
        customer.email = data.emailAddress;
        customer.freeBoxId = data.freeBoxId;
        
        customer.cards = [];

        if (_.has(data, 'cards') && _.isArray(data.cards)) {
            _.each(data.cards, function(card) {
                customer.cards.push(CreditCard.make(card));
            })
        }

        if (_.has(data, 'address') && _.isObject(data.address)) {
            customer.billingAddress = BillingAddress.make(data.address);
        }
    
        return customer;
    }
}
