import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-uri-value-2',
  template:
    '<app-common-input [control]="control" placeholder="External link" [validatorErrors]="emailError"></app-common-input>',
})
export class UriValue2Component {
  @Input() control: FormControl<string>;
  readonly emailError = [{ errorKey: 'email', message: 'This is not a valid email.' }];
}
