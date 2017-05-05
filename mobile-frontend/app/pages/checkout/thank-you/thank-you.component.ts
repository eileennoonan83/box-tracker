import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../../../shared/auth/auth.service";

@Component({
    templateUrl: "pages/checkout/thank-you/thank-you.html"
})

export class CheckoutThankYouComponent {

    constructor(private auth: AuthService, private router: Router) {}

    reset() {
        this.auth.reset();
    }

}
