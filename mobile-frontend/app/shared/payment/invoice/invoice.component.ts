import { Component, Input } from "@angular/core";

import { Box } from "../../box/box";

@Component({
    selector: 'box-tracker-invoice',
    templateUrl: "shared/payment/invoice/invoice.html",
})

export class InvoiceComponent {

    invoiceBoxRows: string;
    private _boxes: Array<Box> = [];

    @Input('boxes') 
    set boxes(boxes: Array<Box>) {
        this._boxes = boxes;
        this.invoiceBoxRows = this.boxes.map(() => "auto").join(',');
    }
    @Input('total') total: number;

    get boxes() : Array<Box> {
        return this._boxes;
    }


}
