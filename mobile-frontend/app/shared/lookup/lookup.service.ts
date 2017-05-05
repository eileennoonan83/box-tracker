import { Http, Response } from "@angular/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";

import dialogs = require("ui/dialogs");
import { LoadingIndicator } from "nativescript-loading-indicator";

import { BaseService } from "../base.service";
import { AuthService } from "../auth/auth.service";

import { Customer } from "../customer/customer";
import { BoxProfile } from "../box/box-profile";

@Injectable()

export class LookupService extends BaseService {

    disambiguatablCustomers: Array<Customer> = [];
    indicator: LoadingIndicator;

    constructor(private auth: AuthService, protected http: Http) {
        super(http);
        this.indicator = new LoadingIndicator;
    }
    
    /**
     * Search for customers who have jobs that are scheduled for the future
     * (for customers who are picking up boxes)
     * @param name 
     */
    customerSearchGetBoxes(name: string) : Observable<Array<Customer>> {
        let url = this.apiUrl + "/customer/searchGetBoxes?s=" + encodeURIComponent(name);;
        return this.customerSearch(url);
    }

    /**
     * Search for customers who have jobs that were scheduled in the past
     * (for customers who are returning boxes)
     * @param name
     */
    customerSearchReturnBoxes(name: string) : Observable<Array<Customer>> {
        let url = this.apiUrl + "/customer/searchReturnBoxes?s=" + encodeURIComponent(name);
        return this.customerSearch(url);
    }

    private customerSearch(url) : Observable<Array<Customer>> {
        let options = { headers: this.getHeaders(this.auth.getUser()) };

        this.indicator.show({message: "Looking up customer ..."})

        return this.http.get(url, options)
            .map((res : Response) => {
                this.indicator.hide();
                return res.json()
                    .customers
                    .map(customer => Customer.make(customer));
            })
            .catch(this.handleErrors);
    }

    loadPickUp(customer : Customer) : Observable<BoxProfile> {
        return this.loadForCustomer(customer, 'getPickUpBoxes')
    }

    loadReturn(customer: Customer) : Observable<BoxProfile> {
        return this.loadForCustomer(customer, 'getReturnBoxes');
    }

    loadForCustomer(customer: Customer, segment) : Observable<BoxProfile> {
        let url = this.apiUrl + "/customer/" + customer.id + "/" + segment,
            headers = this.getHeaders(this.auth.getUser());
        
        this.indicator.show({message: "Loading ..."});

        return this.http.get(url, { headers: headers })
            .map((response: Response) => {
                this.indicator.hide();
                return BoxProfile.make(response.json().data);
            })
            .catch(this.handleErrors);
    }

    confirmSingleCustomerJobResult(customers: Array<Customer>) : Promise<boolean> {
        if (customers.length === 1) {
            // there's only one possible job so let's make sure it's the right one ...
            let customer = customers[0], 
                confMsg = "Found 1 eligible result: \n\n "
                    + "\n" + customer.fullName 
                    + "\n" + customer.email
                    + "\n" + customer.phone
                    + "\n\n Is this the correct customer?";
                 
                 return dialogs.confirm({
                    title: "Confirm Customer",
                    message: confMsg,
                    okButtonText: "Yes",
                    cancelButtonText: "No"
                });
        } else {
            throw Error("Not a single result");
        }
    }

    private options() {
        return { headers: this.getHeaders(this.auth.getUser()) };
    }
}
