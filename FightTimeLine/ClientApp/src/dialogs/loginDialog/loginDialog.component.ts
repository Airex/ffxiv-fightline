import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { NzModalRef } from "ng-zorro-antd/modal";
import { first } from 'rxjs/operators';
import { IAuthenticationService } from "../../services/authentication.service-interface"
import { authenticationServiceToken } from "../../services/authentication.service-provider"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"

@Component({
  selector: "loginDialog",
  templateUrl: "./loginDialog.component.html",
  styleUrls: ["./loginDialog.component.css"]
})
export class LoginDialog implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(authenticationServiceToken) private authenticationService: IAuthenticationService,
    private notification: ScreenNotificationsService,
    public dialogRef: NzModalRef) {

    this.dialogRef.getConfig().nzFooter = [
      {
        label: "Cancel",
        type: "primary",
        onClick: () => this.dialogRef.destroy()
      },
      {
        label: "Login",
        onClick: () => this.onLoginClick()
      }
    ];
  }

  get f() { return this.loginForm.controls; }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // reset login status
    this.authenticationService.logout();
  }

  onLoginClick() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {

      Object.keys(this.loginForm.controls).forEach(it => {
        this.loginForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.loading = true;
    this.authenticationService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.dialogRef.destroy(data);
        },
        error => {
          this.notification.error("Invalid username or password");
          this.loading = false;
        });
  }

  onSignUp() {
    this.dialogRef.destroy({ signup: true });
    return false;
  }

  onNoClick() {
    this.dialogRef.destroy();
  }
}

