import { Injectable } from "@angular/core";
import dialogs = require("ui/dialogs");
import { Response } from "@angular/http";

@Injectable()
export class ErrorDisplayer {

    static alert(err: Response, callback = ()=>{}) {
        let msg = "The following error(s) occurred: ";

        err.json().errors.map((message) => {
            msg += "\n" + message;
        });

        dialogs.alert(msg).then(callback);
    }
}
