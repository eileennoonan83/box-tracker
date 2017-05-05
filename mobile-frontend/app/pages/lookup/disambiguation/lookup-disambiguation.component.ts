import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";

import dialogs = require("ui/dialogs");

import { LookupService } from "../../../shared/lookup/lookup.service";
import { BoxService } from "../../../shared/box/box.service";
import { ErrorDisplayer } from "../../../shared/util/error-displayer";
import { Customer } from "../../../shared/customer/customer";
import { BoxProfile } from "../../../shared/box/box-profile";

@Component({
    templateUrl: "pages/lookup/disambiguation/lookup-disambiguation.html"
})

export class LookupDisambiguationComponent {

    customers: Array<Customer> = [];
    loading: boolean = false;
    helpText: string = "A number of results were returned for your search. \nPlease select the correct one ..."

    constructor(private lookupService: LookupService, private boxService: BoxService, private router: Router) {}

    ngOnInit() {
        this.customers = this.lookupService.disambiguatablCustomers;
    }

    select(customer: Customer) {
        let message = "Name: " + customer.fullName
                +"\n Email: " + customer.email
                +"\n Phone: " + customer.phone
                +"\n\n Is this the right customer?",
            data = {
                message: message,
                title: "Confirm Customer",
                okButtonText: "Yes",
                cancelButtonText: "No"
            }

        dialogs.confirm(data).then((result) => {
            if (result) {
                this.loading = true;
                this.lookupService
                    .loadPickUp(customer)
                    .subscribe((box: BoxProfile)=> this.boxLookupSuccess(box));
            }
        });
    }

    protected boxLookupSuccess(box: BoxProfile) {
        this.loading = false;

        this.boxService.setBoxProfile(box);
        this.router.navigate(["/" + this.boxService.managerRoute]);
    }

}
