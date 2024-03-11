import { AfterViewInit, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Cardinality, Constants, PropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list
      [itemTpl]="itemTpl"
      [newValue]="newValue"
      [formArray]="formArray"
      [cardinality]="cardinality"></app-nu-list>

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
      <mat-slide-toggle [formControl]="item" style="width: 100%"></mat-slide-toggle>
    </ng-template>

    <ng-template let-item #colorTpl>
      <app-color-value-2 [control]="item"></app-color-value-2>
    </ng-template>

    <ng-template let-item #textTpl>
      <app-common-input [control]="item" style="width: 100%"></app-common-input>
    </ng-template>

    <ng-template let-item #dateTpl>
      <app-date-value-handler #dateInput [formControl]="item"></app-date-value-handler>
    </ng-template>

    <ng-template let-item #timeTpl>
      <app-time-value-2 #dateInput [control]="item"></app-time-value-2>
    </ng-template>

    <ng-template #defaultTpl><span style="width: 100%">Nothing to show</span></ng-template>
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
  @Input() objectType: PropertyDefinition['objectType'];
  @Input() cardinality: Cardinality;
  @Input() formArray: FormArray;

  @ViewChild('intTpl') intTpl: TemplateRef<any>;
  @ViewChild('decimalTpl') decimalTpl: TemplateRef<any>;
  @ViewChild('booleanTpl') booleanTpl: TemplateRef<any>;
  @ViewChild('colorTpl') colorTpl: TemplateRef<any>;
  @ViewChild('textTpl') textTpl: TemplateRef<any>;
  @ViewChild('dateTpl') dateTpl: TemplateRef<any>;
  @ViewChild('timeTpl') timeTpl: TemplateRef<any>;
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
    console.log(this.objectType, this.cardinality);
  }

  private getTemplate(): { template: TemplateRef<any>; newValue: any } {
    switch (this.objectType) {
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
      case Constants.DateValue:
        return { template: this.dateTpl, newValue: '' };
      case Constants.TimeValue:
        return { template: this.timeTpl, newValue: '' };
      default:
        return { template: this.defaultTpl, newValue: null };
    }
  }

  protected readonly Cardinality = Cardinality;
}
