import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (isNaN(control.value)) {
      return;
    }
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
