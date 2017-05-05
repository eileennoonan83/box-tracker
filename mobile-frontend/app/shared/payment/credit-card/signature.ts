import { ImageSource } from "image-source";
var imageSource = require("image-source");
var _ = require("lodash");

export class Signature {

    id: number;
    createdAt: Date;
    private _source: ImageSource;

    public static make(data) {

        let sig = new Signature;

        sig.id = data.id;
        sig.createdAt = data.createdAt;

        sig.source = data.source;

        return sig;
    }

    get base64() {
        return this._source.toBase64String("png");
    }

    set source(source) {
        if (source instanceof ImageSource) {
            this._source = source;
        } else if (_.isString(source) && this._isBase64(source)) {
            this._source = imageSource.fromBase64(source)
        } else {
            let imgSource;
            try {
                imgSource = imageSource.fromNativeSource(source);
            } catch (Exception) {
                throw Error("invalid data.source given in Signature.make(). Received "+JSON.stringify(source));
            }

            this._source = imgSource;
        }
    }

    get source() : ImageSource {
        return this._source;
    }


    protected _isBase64(string: string) : boolean {
        var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        return base64regex.test(string);
    }
}
