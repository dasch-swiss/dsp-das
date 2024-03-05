import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-uri-value-2',
  template:
    '<app-common-input [control]="control" placeholder="uri" [validatorErrors]="emailError"></app-common-input>',
})
export class UriValue2Component {
  control = new FormControl<string>('', [Validators.email]);
  @Output() dataChange = new EventEmitter<string>();
  readonly emailError = [{ errorKey: 'email', message: 'This is not a valid email.' }];
  constructor() {
    this.control.valueChanges.subscribe(control => {
      if (this.control.valid) {
        this.dataChange.emit(control);
      }
    });
  }
}
