
import { UntypedFormGroup } from '@angular/forms';

// custom validator to check that two fields match
export function time(controlName: string) {
  return (formGroup: UntypedFormGroup) => {
    const control = formGroup.controls[controlName];

    if (control.errors && !control.errors.time) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    const r = new RegExp("^[0-2]\\d:[0-5]\\d$");
    // set error on matchingControl if validation fails
    if (!r.test(control.value )) {
      control.setErrors({ time: true });
    } else {
      control.setErrors(null);
    }
  };
}
