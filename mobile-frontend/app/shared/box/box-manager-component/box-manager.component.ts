import { 
    Component, 
    OnInit, 
    Input, 
    Output, 
    EventEmitter
} from "@angular/core";

import scrollViewModule = require("ui/scroll-view");
import dialogs = require("ui/dialogs");

var _ = require("lodash");

import { BoxManagerConfigService, BoxManagerConfig } from "../box-manager-config.service";

import { Box } from "../../../shared/box/box";

@Component({
    selector: "box-manager",
    templateUrl: "shared/box/box-manager-component/box-manager.html",
    styleUrls: ["shared/box/box-manager-component/box-manager-common.css"]
})

export class BoxManagerComponent implements OnInit {

    private _boxesValue: Array<Box> = [];
    private _origBoxes: Array<Box> = [];
    private _origSet: boolean = false;
    boxDisplay: Array<Box> = [];
    rows: Array<Array<Box>> = [];
    numbers: Array<Array<number>>;
    rowString: string = '';
    changed: boolean = false;

    @Input() filterEmpty: boolean = false;
    @Input() isReturning: boolean = false;
    @Input() total: number;
    @Input() options: Array<Box>;
    @Input() 
    set boxes(val: Array<Box>) {
        this._boxesValue = val || [];
        if (!this._origSet) {
            this._origBoxes = _.cloneDeep(this._boxesValue);
            this._origSet = true;
        }
    };    

    @Output() onTotalChange$ = new EventEmitter<number>();
    @Output() onBoxesChange$ = new EventEmitter<Array<Box>>();

    constructor(private configService: BoxManagerConfigService) {}

    ngOnInit() {
        let config = _.cloneDeep(this.configService.config);
        this.numbers = config.numbers;
        this.boxDisplay = config.options;
        // this.boxDisplayInit();
        this.changed = false;
    }

    qtyChange(val, i) {
        let origTotal = this.total;
        this.boxDisplay[i].quantity = parseInt(val);

        this.recalculate();

        if (origTotal !== this.total) {
            this.changed = true;
        }
    }

    recalculate() {
        let boxes = [];
        this.total = 0;

        this.boxDisplay.map((box: Box) => {
            if(box.quantity > 0) {
                this.total += box.cost * box.quantity;
                boxes.push(box);
            }
        })
        this._boxesValue = _.cloneDeep(boxes);
        this.onTotalChange$.emit(this.total);
        this.onBoxesChange$.emit(boxes);
    }

    // boxDisplayInit() {
    //     let boxes = this._boxesValue;
        
    //     this.boxDisplay = this.options
    //         .map((option: Box, i) => {
    //             let result = (<any>Object).assign({}, option);
    //             let existing = boxes.filter(
    //                 function (box: Box) {
    //                     return box.id === option.id;
    //                 }
    //             );
    //             result.quantity = existing.length
    //                 ? existing[0].quantity 
    //                 : 0;
    //             return result;
    //         });
    //     if (this.filterEmpty) {
    //         this.boxDisplay = this.boxDisplay
    //             .filter((box: Box) => box.quantity > 0);
    //     }
    //     this.boxDisplay.map((box: Box, i) => {
    //         let size = this.isReturning ? box.quantity + 1 : 30;
    //         this.numbers[i] = new Array(size);
    //     })
    // }

    reset() {
        dialogs.confirm("Reset boxes?").then((confirmed) => {
            if (confirmed) {
                // this.boxDisplay = _.clone(this.configService.config.options);
                this.boxDisplay.map((box: Box, i) => {
                    let existing = this._origBoxes.filter(
                        function (origBox: Box) : boolean {
                            return origBox.id === box.id;
                        }
                    );   
                    if (_.isArray(existing) && existing.length > 0) {
                        this.boxDisplay[i].quantity = existing[0].quantity;
                    } else {
                        this.boxDisplay[i].quantity = 0;
                    }         
                })
                this.recalculate();
                this.changed = false;
            }
        });
    }
}
