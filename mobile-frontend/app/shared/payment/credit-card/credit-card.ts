import { BillingAddress } from "./billing-address";

export class CreditCard {

    id: number;
    customerId: number;
    cardHolderName: string;
    private number: string;
    expirationDate: string;
    expirationMonth: string;
    expirationYear: string;
    cvv: string;
    type: string;
    billing: BillingAddress; 

    public static make(data) {
        let card = new CreditCard,
            billingData = data.billing || {};

        

        card.id = data.id;
        card.customerId = data.customerId;
        card.cardHolderName = data.cardholderName;
        card.number = data.number;
        card.expirationDate = data.expirationDate;
        card.cvv = data.cvv;
        card.type = data.type;
        card.billing = BillingAddress.make(billingData);
        
        return card;
    }

    set cardNumber(number) {
        this.number = number.replace(/\D/g, '');
    }

    get cardNumber() {
        return this.number;
    }

    get formattedExpirationDate() {
        return this.expirationDate.substring(0,2) 
            + " / " 
            + this.expirationDate.substring(2, 4);
    }

    public exists() {
        return this.id.toString().length > 0;
    }

}
