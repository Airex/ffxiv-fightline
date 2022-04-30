import { Component } from "@angular/core";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
    selector: "loadingDialog",
    templateUrl: "./loadingDialog.component.html",
    styleUrls: ["./loadingDialog.component.css"]
})
export class LoadingDialog {

    public text = "Loading...";

    constructor(
        public dialogRef: NzModalRef
        ) {
    }
}

