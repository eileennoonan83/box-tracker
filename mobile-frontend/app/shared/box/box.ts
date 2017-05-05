export class Box {

    id: number;
    label: string;
    quantity: number;
    cost: number;
    dimensions: string;
    cube: number;
    refundable: boolean;

    public static make = function (data) {

        let box = new Box;

        box.id = data.id;
        box.label = data.label;
        box.quantity = data.quantity;
        box.cost = data.cost;
        box.dimensions = data.dimensions;
        box.cube = data.cube;
        box.refundable = data.refundable;

        return box;        
    }

    get costDollars() {
        return (this.cost / 100).toFixed(2);
    }

    public static describeBoxes(boxes: Array<Box>) {
        return boxes
            .map(box => Box.make(box).description)
            .join(', ');
    }

    get description() {
        return this.quantity + "x " + this.label + " @ $"+this.costDollars;
    }
}
