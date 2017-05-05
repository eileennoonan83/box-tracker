import { Box } from "../../../shared/box/box";

var _ = require('lodash');

export class ChargeDescription {

    name: string;
    amount: number;
    description: string;
    itemized: Array<Box> = [];

    static make(data) {
        let desc = new ChargeDescription;

        desc.name = data.name;
        desc.amount = data.amount;
        desc.description = data.description;

        if (_.has(data, 'itemized') && _.isArray(data.itemized)) {
            desc.itemized = data.itemized;
        }

        return desc;
    }
}
