import { Component, Input } from "@angular/core";
import { Box } from "../../shared/box/box";
import { BoxProfile } from "../../shared/box/box-profile";

@Component({
    selector: "sidebar-info",
    templateUrl: "shared/sidebar-info/sidebar-info.html"
})

export class SidebarInfoComponent {
    @Input('box') box: BoxProfile;
    @Input('boxes') boxes: Array<Box>;
    @Input('total') total: number;
}
