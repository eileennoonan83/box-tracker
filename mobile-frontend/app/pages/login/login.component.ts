import { Injectable, Component, OnInit } from "@angular/core";
import { Response } from "@angular/http";
import { RouterExtensions } from "nativescript-angular/router";

var _ = require("lodash");
var dialogs = require("ui/dialogs");
import { SelectedIndexChangedEventData } from "nativescript-drop-down";
import { SecureStorage } from "nativescript-secure-storage";
import { LoadingIndicator } from "nativescript-loading-indicator";

import { User } from "../../shared/user/user";
import { AuthService } from "../../shared/auth/auth.service";
import { SwipeGestureEventData } from "ui/gestures";

@Component({
    templateUrl: "pages/login/login.html"
})

export class LoginComponent {
    user: User;
    rememberMe: boolean = false;
    storage: SecureStorage;
    indicator: LoadingIndicator;

    constructor(private auth: AuthService, private router: RouterExtensions) {
        this.user = new User();
        this.storage = new SecureStorage;
        this.indicator = new LoadingIndicator;
    }

    ngOnInit() {
        this._loadCredentials();
    }

    rememberMeSwitchChanged(value) {
        this.rememberMe = value;
    }

    signIn() {
        this.indicator.show({ message: "Authenticating ..."});
        this.auth
            .login(this.user)
            .subscribe((res: Response) => {
                this.indicator.hide();
                if (res.status === 200) {
                    if (this.rememberMe) {
                        this._saveCredentials();
                    } else {
                        this._removeCredentials();
                    }
                    this.indicator.hide();
                    this.router.navigate(["/lookup"], { clearHistory: true }) 
                } else {
                    dialogs.alert("We could not find an account to match that email and password combination.").then(() => {});
                }
            },
            (error: Response) => {
                this.indicator.hide();
                if (error.status === 401) {
                    dialogs.alert("Invalid credentials").then(() => {});    
                };
                dialogs.alert("There was an error loading your account.").then(() => {});    
            }
        );
    }

    private _loadCredentials() {
        this.storage
            .get({key: "email"})
            .then((email) => {
                if (_.isNull(email)) {
                    return;
                }
                this.user.email = email;
                this.storage
                    .get({key: "password"})
                    .then((password) => {
                        if (_.isNull(password)) {
                            return;
                        }
                        this.user.password = password;
                        this.rememberMe = true;
                })
            });
    }

    private _saveCredentials() {
        this.storage
            .set({key: "email", value: this.user.email})
            .then(() => {
                this.storage
                    .set({key: "password", value: this.user.password})
                    .then(() => {})
            })
    }

    private _removeCredentials() {
        this.storage
            .remove({key: "email"})
            .then(() => {
                this.storage
                    .remove({key: "password"})
                    .then(() => {})
            })
    }

}
