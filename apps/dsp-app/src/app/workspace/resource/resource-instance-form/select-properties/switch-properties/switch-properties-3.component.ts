import { AfterViewInit, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Constants, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list [itemTpl]="itemTpl" [newControl]="newControl" [formArray]="formArray"></app-nu-list>

    <ng-template let-item #intTpl>
      <mat-form-field style="width: 100%">
        <input matInput [formControl]="item" type="number" />
      </mat-form-field>
    </ng-template>
  `,
})
export class SwitchProperties3Component implements AfterViewInit {
  @Input() property: ResourcePropertyDefinition;
  @Input() formArray: FormArray;

  @ViewChild('intTpl') intTpl: TemplateRef<any>;

  itemTpl: TemplateRef<any>;
  newControl: FormControl<any>;

  constructor(private _cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const data = this.getTemplate();
    this.itemTpl = data.template;
    this.newControl = data.control;
    this._cd.detectChanges();
  }

  private getTemplate() {
    switch (this.property.objectType) {
      case Constants.IntValue:
        return { template: this.intTpl, control: new FormControl(0) };
    }
  }
}
