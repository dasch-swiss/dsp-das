import { AfterViewInit, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Constants, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list [itemTpl]="itemTpl" [newValue]="newValue" [formArray]="formArray"></app-nu-list>

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

    <ng-template let-item #textTpl>
      <app-common-input [control]="item"></app-common-input>
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
  @ViewChild('textTpl') textTpl: TemplateRef<any>;
  @ViewChild('defaultTpl') defaultTpl: TemplateRef<any>;

  itemTpl: TemplateRef<any>;
  newValue: any;

  constructor(private _cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const data = this.getTemplate();
    this.itemTpl = data.template;
    this.newValue = data.newValue;
    this.formArray.push(new FormControl(this.newValue));
    this._cd.detectChanges();
  }

  private getTemplate(): { template: TemplateRef<any>; newValue: any } {
    console.log(this.property.objectType);
    switch (this.property.objectType) {
      case Constants.IntValue:
        return { template: this.intTpl, newValue: 0 };
      case Constants.DecimalValue:
        return { template: this.decimalTpl, newValue: 0 };
      case Constants.BooleanValue:
        return { template: this.booleanTpl, newValue: false };
      case Constants.ColorValue:
        return { template: this.colorTpl, newValue: '#000000' };
      case Constants.TextValue:
        return { template: this.textTpl, newValue: '' };
      default:
        return { template: this.defaultTpl, newValue: null };
    }
  }
}
