import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-uri-value-2',
  template: '<app-common-input [control]="control" placeholder="uri"></app-common-input>',
})
export class UriValue2Component {
  control = new FormControl<string>('', [Validators.email]);
}
