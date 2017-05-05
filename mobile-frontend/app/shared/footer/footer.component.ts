import { Component, Input, EventEmitter } from "@angular/core";

import { AuthService } from "../auth/auth.service";

@Component({
    selector: "box-tracker-footer",
    templateUrl: "shared/footer/footer.html"
})

export class FooterComponent {

    @Input('row') row: string = '1';
    @Input('colSpan') colSpan: string = '1';

    constructor(private auth: AuthService) {}

    logout() {
        this.auth.logout();
    }

    cancel() {
        this.auth.cancel();
    }

}
