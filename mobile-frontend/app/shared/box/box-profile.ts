import { Customer } from "../customer/customer";
import { User } from "../user/user";
import { Box } from "./box";

var _ = require('lodash');
var moment = require('moment');

export class BoxProfile {

    // Data from API
    id: number;
    // job: Job;
    customer: Customer;
    owner: User;
    outBoxes: Array<Box> = [];
    balance: number = 0;    
    options: Array<{}> = [];
    scheduledReturnDate: string = this.formatDate(moment().add(1, "months").toDate());
    private _scheduledReturnDateObject: Date = new Date;
    actualReturnDate: string;
    private _actualReturnDateObject: Date = new Date;
    pickupDate: string;
    createdAt: string;
    updatedAt: string;

    // Data from application
    returningBoxes: Array<Box> = [];
    pickupBoxes: Array<Box> = [];
    deposit: number = 0;
    refund: number = 0;

    public static make = function (data) {

        let box = new BoxProfile;
        box.id = data.id;

        // if (_.has(data, 'job')) {
        //     box.job = Job.make(data.job);
        // }
        if (_.has(data, 'customer')) {
            box.customer = Customer.make(data.customer);
        }
        if (_.has(data, 'owner')) {
            box.owner = User.make(data.owner);
        }

        if (_.has(data, 'outBoxes')) {
            box.outBoxes = data.outBoxes.map((box) => {
                return Box.make(box);
            })
        }

        ['options', 'returningBoxes', 'pickupBoxes', 
        'deposit', 'refund', 'balance', 'scheduledReturnDate', 'actualReturnDate', 
         'pickupDate','createdAt','updatedAt'].forEach((k) => {
            if(_.has(data, k)) {
                box[k] = data[k];
            }
        });

        return box;        
    }

    get formattedScheduledReturnDate() {
        return this.formatDate(this.scheduledReturnDate);
    }

    get formattedActualReturnDate() {
        if (this.actualReturnDate.length) {
            return this.formatDate(this.actualReturnDate);
        }
        return '';
    }

    get scheduledReturnDateObject() : Date {
        let dateObj = new Date(this.scheduledReturnDate);
        this._scheduledReturnDateObject.setDate(dateObj.getDate());
        this._scheduledReturnDateObject.setMonth(dateObj.getMonth());
        this._scheduledReturnDateObject.setFullYear(dateObj.getFullYear());
        return this._scheduledReturnDateObject;
    }

    set scheduledReturnDateObject(date: Date) {
        this.scheduledReturnDate = this.formatDate(date);
    }

    get actualReturnDateObject() : Date {
        let dateObj = new Date(this.actualReturnDate);
        this._actualReturnDateObject.setDate(dateObj.getDate());
        this._actualReturnDateObject.setMonth(dateObj.getMonth());
        this._actualReturnDateObject.setFullYear(dateObj.getFullYear());
        return this._actualReturnDateObject;
    }

    set actualReturnDateObject(date: Date) {
        this.actualReturnDate = this.formatDate(date);
    }

    get returnScheduled() {
        return this.scheduledReturnDate.length > 0;
    }

    clone () {
        return BoxProfile.make(this);
    }

    protected formatDate(date) {
        if (date !instanceof Date) {
            date = new Date(date);
        }
        return moment(date).format("MM/DD/YYYY");
    }
}
