import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Response } from "@angular/http";
import { Observable } from "rxjs";

import { RouterExtensions } from "nativescript-angular";
import { LoadingIndicator } from "nativescript-loading-indicator";
declare var MBProgressHUDModeCustomView;

import dialogs = require("ui/dialogs");
var _ = require("lodash");

import { BoxService } from "../../../shared/box/box.service";
import { PaymentService } from "../../../shared/payment/payment.service";
import { PaymentTermsService } from "../../../shared/payment/payment-terms.service"; 
import { ErrorDisplayer } from "../../../shared/util/error-displayer";

import { BoxProfile } from "../../../shared/box/box-profile";
import { Box } from "../../../shared/box/box";
import { Signature } from "../../../shared/payment/credit-card/signature";
import { Charge } from "../../../shared/payment/credit-card/charge";
import { CreditCard } from "../../../shared/payment/credit-card/credit-card";


@Component({ templateUrl: "pages/checkout/complete-order/complete-order.html" })

export class CompleteOrderComponent implements OnInit {

    box: BoxProfile;
    boxes: Array<Box> = [];
    total: number;
    invoiceBoxRows: string;
    getIsEnabled: boolean = true;
    agreed: boolean = false;
    signature?: Signature;
    loading: boolean = false;
    indicator: LoadingIndicator;
    unreturnedBoxesRemain: boolean = false;
    terms: string = "";
    title: string = "";

    @ViewChild("DrawingPad") DrawingPad: ElementRef;

    constructor(
        protected boxService: BoxService, 
        protected paymentService: PaymentService,
        protected paymentTermsService: PaymentTermsService,
        protected router: RouterExtensions
    ){
        this.indicator = new LoadingIndicator;
    }

    ngOnInit() {
        let box = this.boxService.getBoxProfile();
        
        if (this.boxService.isGetting()) {
            this.total = box.deposit;
            this.boxes = box.pickupBoxes;
        } else {
            this.total = box.refund;
            this.boxes = box.returningBoxes;
        }
        this.box = box;
        this.terms = this.paymentTermsService.terms;
        if (this.paymentService.paymentMethod === PaymentService.CreditCardPaymentMethod) {
            this.title = "Complete Order with Credit Card";
        } else if (this.paymentService.paymentMethod === PaymentService.CashPaymentMethod) {
            this.title = "Complete Order with Cash";
        }
    }

    completeOrder() {
        this.indicator.show({message: "Storing boxes ..."})
        this.getIsEnabled = false;

        this.getBoxOperationObservable()
            .subscribe(
                (box: BoxProfile) => this.boxOperationSuccess(box),
                (err: Response) => this.error(err)
            );
    }

    protected getBoxOperationObservable()  : Observable<BoxProfile> {
        if (this.boxService.isGetting()) {
            return this.boxService.getBoxes(this.boxes);
        } else if (this.boxService.isReturning()){
            return this.boxService.returnBoxes(this.boxes);
        }
    }

    protected boxOperationSuccess(box: BoxProfile) {
        this.box = box;
        if(this.boxService.isReturning() && box.outBoxes.length > 0) {
            // need to prompt user about this later
            this.unreturnedBoxesRemain = true;
        }
        this.runTransaction();
    }

    protected runTransaction() {
        let charge = this.getCharge();
        this.indicator.hide();
        this.indicator.show({message: "Running transaction ..."});

        this.getTransactionObservable(charge)
            .subscribe(
                (res: Response) => this.transactionSuccess(res),
                (err: Response) => this.error(err)
            );
    }

    protected transactionSuccess(res: Response) {
        this.indicator.hide();
        if (this.unreturnedBoxesRemain) {
            this.checkAndClearUnreturned();
        } else {
            this.success();
        }
    }

    protected getCharge() : Charge {
        let charge = Charge.make({
            amount: this.total,
            description: {
                name: this.boxService.isReturning() ? 'Free Box Refund' : 'Free Box Deposit',
                amount: this.total,
                description: this.boxService.isReturning() ? 'Free Box Refund' : 'Free Box Deposit', 
                items: this.boxes.map((box: Box) => {
                    return {
                        label: box.label,
                        description: box.description,
                        cost: box.cost * box.quantity
                    }
                })
            },
            signature: Signature.make(this.signature)
        });

        if (this.paymentService.paymentMethod === PaymentService.CreditCardPaymentMethod) {
            charge.card = this.paymentService.activeCard;
        }

        return charge;
    }

    protected getTransactionObservable(charge: Charge){
        if (this.boxService.isGetting()) {
            return this.paymentService.chargeDeposit(charge, this.box)
        } else {
            return this.paymentService.issueRefund(charge, this.box)
        }
    }

    protected checkAndClearUnreturned() {
        dialogs.confirm({
            title: "Clear Remaining Boxes?",
            message: "It looks like not all the boxes were returned. \n\nDo you wish to clear the remaining boxes from the system and forfeit the customer's deposit?",
            okButtonText: "Yes",
            cancelButtonText: "No"
        }).then((clearRemaining) => this._handleClearUnreturnedDialogResponse(clearRemaining));
    }

    private _handleClearUnreturnedDialogResponse(clearRemainin) {
        if (clearRemainin) {
            dialogs.confirm({
                title: "Confirm - Are You sure?",
                message: "Are you sure you want to clear remaining boxes from the system and forfeit the customer's deposit for those boxes?",
                okButtonText: "Yes",
                cancelButtonText: "No"
            }).then((confirmClear) => this._handleClearUnreturnedConfirmationResponse(confirmClear));
        } else {
            this.success();
        }
    }

    private _handleClearUnreturnedConfirmationResponse(confirmClear) {
        if (confirmClear) {
            this.indicator.show({message: "Clearing unreturned boxes ..."});
            this.boxService
                .clearUnreturnedBoxes(this.box)
                .subscribe(
                    () => this.success(),
                    (err: Response) => {
                        this.indicator.hide();
                        this.getIsEnabled = true;
                        ErrorDisplayer.alert(err, () => {
                            this.success();
                        });
                    });
        } else {
            this.success();
        }
    }



    clearSignature(args) {
        var pad = this.DrawingPad.nativeElement;
        pad.clearDrawing();
        this.signature = null;
        this.agreed = false;
    }

    agreeSwitchChange(val) {
        this.agreed = val;

        if (val) { 
            let pad = this.DrawingPad.nativeElement;
            pad.getDrawing().then(
                data => this.signature = Signature.make({source: data}), 
                err => {
                    dialogs.alert("Signature must not be empty").then(() => {
                        this.agreed = false;
                    });
                });        
        }
    }

    protected error(err: Response, callback = ()=>{}) {
        this.indicator.hide();
        this.getIsEnabled = true;
        ErrorDisplayer.alert(err, callback)
    }

    get readyToCompleteTransaction() : boolean {
        return this.agreed && (this.signature instanceof Signature) && this.getIsEnabled
    }

    protected success(){
        this.indicator.hide();
        this.indicator.show({ message: "Complete!", ios: {mode: MBProgressHUDModeCustomView, customView: 'Checkmark.png'}});
        setTimeout(() => {
            this.indicator.hide();
            this.router.navigate(['checkout.thankYou'], { clearHistory: true });
        }, 2000)
    }
}
