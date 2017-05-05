import { Component, Injectable } from "@angular/core";
import { registerElement } from "nativescript-angular/element-registry";

// registerElement("DropDown", () => require("nativescript-drop-down/drop-down").DropDown);

@Component({
    selector: "main",
    template: "<page-router-outlet></page-router-outlet>"
})
export class AppComponent {}
