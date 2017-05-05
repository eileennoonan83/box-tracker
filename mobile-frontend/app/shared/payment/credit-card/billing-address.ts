var _ = require("lodash");

export class BillingAddress {
    name: string
    address: string
    address2: string
    city: string
    state: string
    zip: string
    country: string

    public static make(data) {
        let address = new BillingAddress;

        address.name = data.name;
        address.address = data.address;
        address.address2 = data.address2;
        address.city = data.city;
        address.state = data.state;
        address.zip = data.zip;
        if (_.has(data, 'country') && _.isString(data.country) && data.country.length > 0)
            address.country = data.country;
        else {
            address.country = "US";
        }

        return address;
    }
}
