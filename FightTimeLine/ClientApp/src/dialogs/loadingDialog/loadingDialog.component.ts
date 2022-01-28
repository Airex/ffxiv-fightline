import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
    selector: "loadingDialog",
    templateUrl: "./loadingDialog.component.html",
    styleUrls: ["./loadingDialog.component.css"]
})
export class LoadingDialog {

    public text: string = "Loading...";

    constructor(
        public dialogRef: NzModalRef
        ) {
    }
}

