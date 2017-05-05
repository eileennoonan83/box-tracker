import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { AppComponent } from "./app.component";
import { routes, navigatableComponents } from "./app.routing";
import { registerElement } from "nativescript-angular/element-registry";
// registerElement("MaskedInput", () => require("nativescript-maskedinput").MaskedInput);
registerElement("DrawingPad", () => require("nativescript-drawingpad").DrawingPad);
registerElement("DropDown", () => require("nativescript-drop-down/drop-down").DropDown);

import { AuthService } from "./shared/auth/auth.service";
import { BoxService } from "./shared/box/box.service";
import { BoxManagerConfigService } from "./shared/box/box-manager-config.service";
import { PaymentService } from "./shared/payment/payment.service";
import { PaymentTermsService } from "./shared/payment/payment-terms.service";
import { LookupService } from "./shared/lookup/lookup.service";
import { ErrorDisplayer } from "./shared/util/error-displayer";

import { BoxManagerComponent } from "./shared/box/box-manager-component/box-manager.component";
import { SidebarInfoComponent } from "./shared/sidebar-info/sidebar-info.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { InvoiceComponent } from "./shared/payment/invoice/invoice.component";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        NativeScriptHttpModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forRoot(routes)
    ],
    declarations: [
        AppComponent,
        ...navigatableComponents,
        BoxManagerComponent,
        SidebarInfoComponent,
        FooterComponent,
        InvoiceComponent
    ],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        AuthService,
        BoxService,
        BoxManagerConfigService,
        PaymentService,
        PaymentTermsService,
        LookupService
    ]
})
export class AppModule { }
