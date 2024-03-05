import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-uri-value-2',
  template: '<app-common-input [control]="control" placeholder="uri"></app-common-input>',
})
export class UriValue2Component {
  control = new FormControl<string>('', [Validators.email]);
  @Output() valueChange = new EventEmitter<string>();

  constructor() {
    this.control.valueChanges.subscribe(control => {
      if (this.control.valid) {
        this.valueChange.emit(control);
      }
    });
  }
}
