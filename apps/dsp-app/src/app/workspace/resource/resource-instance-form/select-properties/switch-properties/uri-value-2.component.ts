import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-uri-value-2',
  template: '<app-common-input></app-common-input>',
})
export class UriValue2Component {
  @Input() control: FormControl<boolean>;
}
