import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Observable } from "rxjs";

import dialogs = require("ui/dialogs");

import { BoxService } from "../../shared/box/box.service";
import { LookupService } from "../../shared/lookup/lookup.service"; 
import { ErrorDisplayer } from "../../shared/util/error-displayer";

import { BoxProfile } from "../../shared/box/box-profile";
import { Customer } from "../../shared/customer/customer";

@Component({
    templateUrl: "pages/lookup/lookup.html"
})

export class LookupComponent {

    jobId: string = '';
    search: string = '';
    box: BoxProfile;

    constructor(private router: Router, private boxService: BoxService, private lookupService: LookupService) {}

    getBoxes() {
        this.boxService.getting();
        
        let lookup = this.lookupService.customerSearchGetBoxes(this.search.trim());
        
        this._handleLookup(lookup);
    }

    returnBoxes() {
        this.boxService.returning();

        let lookup = this.lookupService.customerSearchReturnBoxes(this.search.trim());

        this._handleLookup(lookup);
    }

    private _handleLookup(lookup: Observable<Array<Customer>>) {
        lookup.subscribe(
            (customers: Array<Customer>) => this._lookupSuccess(customers),
            (err: Response) => {
                ErrorDisplayer.alert(err);
            }
        );
    }

    private _lookupSuccess(customers: Array<Customer>) {
        if (customers.length === 0) {
            // D:
            this._noResults();
        } else if (customers.length === 1) {
            // we only got one result!
            // let's make sure it's the right one and load it
            this.lookupService
                .confirmSingleCustomerJobResult(customers)
                .then((confirmed) => {
                    if (confirmed) {
                        this._loadBox(customers[0]);
                    } else {
                        // D:
                        this._noResults();
                    }
                })
        } else {
            // ahh well we got more than one result
            // looks like we need to disambiguate this sucker
            this.lookupService.disambiguatablCustomers = customers;
            this.router.navigate(["/lookup.disambiguation"]);
        }
    }

    private _loadBox(customer: Customer) {
        let loadObservable = this.boxService.isGetting()
            ? this.lookupService.loadPickUp(customer)
            : this.lookupService.loadReturn(customer);

        loadObservable.subscribe(
            (boxProfile : BoxProfile)=> {
                this.boxService.setBoxProfile(boxProfile);
                this.boxService.newBoxProfileLoaded$.emit(true);
                this.router.navigate(["/"+this.boxService.managerRoute]);
            },
            this._handleError
        );
    }

    private _handleError(error) {
        
        if (error instanceof Response) {
            if (error.status == 404) {
                this._noResults();
                return;
            };
            if( error.status == 403) {
                dialogs.alert('Authentiation failed');
                return;
            }
        } else {
            dialogs.alert('An unknown error occurred, failed to load results');
        }
    }

    private _noResults() {
        let msg = this.boxService.isGetting()
            ? "No one in the system matched that search"
            : "No one in the system matched that search and had boxes or supplies to return"
        dialogs.alert(msg).then(() => {});
    }
}
