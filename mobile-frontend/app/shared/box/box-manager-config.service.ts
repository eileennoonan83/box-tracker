import { Injectable } from "@angular/core";

var _ = require('lodash');

import { AuthService } from "../auth/auth.service";
import { BoxService } from "./box.service";
import { Box } from "./box";
import { BoxProfile } from "./box-profile";

@Injectable()
export class BoxManagerConfigService {

    options: Array<Box> = [];
    boxes: Array<Box> = [];
    private _config?: BoxManagerConfig = null;

    constructor(private boxService: BoxService, private auth: AuthService) {
        this.boxService.newBoxProfileLoaded$.subscribe(() => this.clear());
        this.auth.cancel$.subscribe(() => this.clear());
        this.auth.loggedOut$.subscribe(() => this.clear());
    }

    get config() : BoxManagerConfig {
        let isNull = _.isNull(this._config),
            isGetting = this.boxService.isGetting(),
            profile = this.boxService.getBoxProfile(),
            hasReturningBoxes = profile.returningBoxes.length > 0;

        if (isGetting) {
            this._config =  this._generateConfig();
        } else if (isNull) {
            this._config = this._generateNonZeroConfig();
        } else {
            this._config = this._generateReturningConfig();
        }

        return this._config;
    }

    clear() {
        this._config = null;
    }

    private _generateConfig() : BoxManagerConfig {
        let options = this._generateOptions(),
            numbers = this._generateNumbers(options);

        return new BoxManagerConfig(options, numbers);
    }

    private _generateNonZeroConfig() : BoxManagerConfig {
        let options = this._generateNonZeroOptions(),
            numbers = this._generateNumbers(options);

        return new BoxManagerConfig(options, numbers)
    }

    private _generateReturningConfig() : BoxManagerConfig {
        let boxes = this.boxService.getBoxProfile().returningBoxes,
            options = this._config.options.map((box: Box, i) => {
                let preselected = _.find(boxes, (preselected : Box) => {
                    return preselected.id === box.id;
                });

                if (preselected) {
                    box.quantity = preselected.quantity;
                } else {
                    box.quantity = 0;
                }

                return box;
            }),
            numbers = this._config.numbers;

        return new BoxManagerConfig(options, numbers);
    }

    private _generateOptions() : Array<Box> {
        let boxProfile = this.boxService.getBoxProfile(),
            boxes = this._getBoxes(boxProfile),
            options = boxProfile.options.map((option: Box) => {
                let result = _.clone(option);
                let existing = boxes.filter(
                    function (box: Box) {
                        return box.id === option.id;
                    }
                );
                result.quantity = existing.length
                    ? existing[0].quantity 
                    : 0;
                return result;
            });

        return options;
    }

    private _generateNonZeroOptions() : Array<Box> {
        return this._generateOptions()
                   .filter((box: Box) => box.quantity > 0);
    }

    private _generateNumbers(options) : Array<Array<number>> {
        let numbers = [];

        options.map((box: Box, i) => {
            let size = 30;
            
            if (this.boxService.isReturning()) {
                size = box.quantity + 1;
            }
            numbers[i] = new Array(size);
        });

        return numbers;
    }

    private _getBoxes(boxProfile: BoxProfile) {
        if (this.boxService.isGetting()) {
            if (boxProfile.pickupBoxes.length > 0) {
                return boxProfile.pickupBoxes;
            }
            return [];
        }

        if (boxProfile.returningBoxes.length > 0) {
            return boxProfile.returningBoxes;
        }

        return boxProfile.outBoxes;
    }
}

export class BoxManagerConfig {
    constructor(
        public options: Array<Box> = [], 
        public numbers: Array<Array<number>> = []
    ) {}
}
