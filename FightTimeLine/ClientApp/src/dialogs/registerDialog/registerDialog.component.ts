import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from "@angular/forms";
import { NzModalRef } from "ng-zorro-antd/modal";
import { first } from 'rxjs/operators';
import { UserService } from "../../services/UserService";


@Component({
  selector: "registerDialog",
  templateUrl: "./registerDialog.component.html",
  styleUrls: ["./registerDialog.component.css"]
})
export class RegisterDialogComponent {
  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: NzModalRef,
    private userService: UserService) {
    this.buildForm();
  }

  form: UntypedFormGroup;
  submitted = false;
  loading = false;
  checkingUser = false;
  captchaLoaded = false;
  notRobot = true;
  private captchaData: string;

  buildForm() {
    this.form = this.fb.group({
      username: [
        "",
        [Validators.required],
        this.isUserNameUnique.bind(this)],
      password: [
        "",
        [Validators.required]
      ],
      repeatPassword: [
        "",
        [Validators.required, this.matchOtherValidator("password")]
      ],
      recaptcha: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  isUserNameUnique(control: UntypedFormControl) {
    const q = new Promise((resolve, reject) => {
      this.checkingUser = true;
      setTimeout(() => {
        this.userService.isUserNameRegistered(control.value).subscribe((val) => {
          this.checkingUser = false;
          if (val) {
            resolve({ isUserNameUnique: !val });
          }
          else { resolve(null); }
        }, () => {
          this.checkingUser = false;
          resolve({ isUserNameUnique: true });
        });
      });
    });
    return q;
  }

  handleLoad() {
    this.captchaLoaded = true;
  }

  handleSuccess(event: any) {
    this.notRobot = true;
    this.captchaData = event;
  }

  handleExpire() {
    this.notRobot = false;
  }

  onRegisterClick() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid || !this.notRobot) {

      Object.keys(this.form.controls).forEach(it => {
        this.form.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.loading = true;


    this.userService.createUser(this.f.username.value, this.f.password.value, this.captchaData)
      .pipe(first())
      .subscribe(
        data => {
          this.dialogRef.destroy({ username: this.f.username.value, password: this.f.password.value });
        },
        error => {
          this.loading = false;
        });
  }
  onNoClick() {
    this.dialogRef.destroy();
  }

  matchOtherValidator(otherControlName: string) {

    let thisControl: UntypedFormControl;
    let otherControl: UntypedFormControl;

    return function matchOtherValidate(control: UntypedFormControl) {

      if (!control.parent) {
        return null;
      }

      // Initializing the validator.
      if (!thisControl) {
        thisControl = control;
        otherControl = control.parent.get(otherControlName) as UntypedFormControl;
        if (!otherControl) {
          throw new Error('matchOtherValidator(): other control is not found in parent group');
        }
        otherControl.valueChanges.subscribe(() => {
          thisControl.updateValueAndValidity();
        });
      }

      if (!otherControl) {
        return null;
      }

      if (otherControl.value !== thisControl.value) {
        return {
          matchOther: true
        };
      }

      return null;

    };

  }
}

