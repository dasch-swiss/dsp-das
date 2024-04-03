import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-text-switch',
  template: `
    <ng-container *ngIf="displayMode; else editMode">{{ control.value }}</ng-container>
    <ng-template #editMode>
      <app-common-input [control]="control" style="width: 100%"></app-common-input>
    </ng-template>
  `,
})
export class TextSwitchComponent implements OnInit {
  @Input() control: FormControl<string>;
  @Input() displayMode = true;

  ngOnInit() {
    console.log('textswitch', this);
  }
}
