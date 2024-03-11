import { AfterViewInit, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Constants, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list [itemTpl]="itemTpl" [newControl]="newControl" [formArray]="formArray"></app-nu-list>

    <ng-template let-item #intTpl>
      <mat-form-field>
        <input matInput [formControl]="item" type="number" />
      </mat-form-field>
    </ng-template>

    <ng-template let-item #decimalTpl>
      <mat-form-field>
        <input matInput [formControl]="item" type="number" />
      </mat-form-field>
    </ng-template>

    <ng-template let-item #booleanTpl>
      <mat-form-field>
        <mat-slide-toggle [formControl]="item"></mat-slide-toggle>
      </mat-form-field>
    </ng-template>

    <ng-template let-item #colorTpl>
      <app-color-value-2 [control]="item"></app-color-value-2>
    </ng-template>

    <ng-template #defaultTpl>Nothing to show</ng-template>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class SwitchProperties3Component implements AfterViewInit {
  @Input() property: ResourcePropertyDefinition;
  @Input() formArray: FormArray;

  @ViewChild('intTpl') intTpl: TemplateRef<any>;
  @ViewChild('decimalTpl') decimalTpl: TemplateRef<any>;
  @ViewChild('booleanTpl') booleanTpl: TemplateRef<any>;
  @ViewChild('colorTpl') colorTpl: TemplateRef<any>;
  @ViewChild('defaultTpl') defaultTpl: TemplateRef<any>;

  itemTpl: TemplateRef<any>;
  newControl: FormControl<any>;

  constructor(private _cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const data = this.getTemplate();
    this.itemTpl = data.template;
    this.newControl = data.control;
    this.formArray.push(this.newControl);
    this._cd.detectChanges();
  }

  private getTemplate(): { template: TemplateRef<any>; control: FormControl<any> } {
    switch (this.property.objectType) {
      case Constants.IntValue:
        return { template: this.intTpl, control: new FormControl(0) };
      case Constants.DecimalValue:
        return { template: this.decimalTpl, control: new FormControl(0) };
      case Constants.BooleanValue:
        return { template: this.booleanTpl, control: new FormControl(false) };
      case Constants.ColorValue:
        return { template: this.colorTpl, control: new FormControl('#000000') };
      default:
        return { template: this.defaultTpl, control: new FormControl(null) };
    }
  }
}
