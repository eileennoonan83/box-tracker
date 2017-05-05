import { LoginComponent } from "./pages/login/login.component";
import { LookupComponent } from "./pages/lookup/lookup.component";
import { LookupDisambiguationComponent } from "./pages/lookup/disambiguation/lookup-disambiguation.component";
import { GetBoxesComponent } from "./pages/box/get/get-boxes.component";
import { ReturnBoxesComponent } from "./pages/box/return/return-boxes.component";
import { PaymentMethodSelectComponent } from "./pages/payment/payment-method-select/payment-method-select.component";
import { NewCreditCardComponent } from "./pages/payment/new-credit-card/new-credit-card.component";
import { ConfirmSuppliesComponent } from "./pages/checkout/confirm-supplies/confirm-supplies.component";
import { CompleteOrderComponent } from "./pages/checkout/complete-order/complete-order.component";
import { CheckoutThankYouComponent } from "./pages/checkout/thank-you/thank-you.component";

export const routes = [ 
    { path: "", component: LoginComponent },
    { path: "lookup", component: LookupComponent },
    { path: "lookup.disambiguation", component: LookupDisambiguationComponent },
    { path: "getBoxes", component: GetBoxesComponent },
    { path: "returnBoxes", component: ReturnBoxesComponent },
    { path: "payment.paymentMethodSelect", component: PaymentMethodSelectComponent },
    { path: "payment.newCreditCard", component: NewCreditCardComponent },
    { path: "checkout.confirmSupplies", component: ConfirmSuppliesComponent },
    { path: "checkout.completeOrder", component: CompleteOrderComponent },
    { path: "checkout.thankYou", component: CheckoutThankYouComponent }
];

export const navigatableComponents = [
    LoginComponent,
    LookupComponent,
    LookupDisambiguationComponent,
    GetBoxesComponent,
    ReturnBoxesComponent,
    PaymentMethodSelectComponent,
    ConfirmSuppliesComponent,
    CompleteOrderComponent,
    NewCreditCardComponent,
    CheckoutThankYouComponent
];
