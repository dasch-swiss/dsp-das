import { AfterViewInit, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, ValidatorFn, Validators } from '@angular/forms';
import {
  Cardinality,
  Constants,
  IHasPropertyWithPropertyDefinition,
  PropertyDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { CustomRegex } from '@dsp-app/src/app/workspace/resource/values/custom-regex';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list
      [itemTpl]="itemTpl"
      [formArray]="formArray"
      [cardinality]="cardinality"
      (addItem)="addItem()"></app-nu-list>

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
      <mat-slide-toggle [formControl]="item" style="width: 100%; align-self: center"></mat-slide-toggle>
    </ng-template>

    <ng-template let-item #colorTpl>
      <app-color-value-2 [control]="item" style="flex: 1"></app-color-value-2>
    </ng-template>

    <ng-template let-item #textTpl>
      <app-common-input [control]="item" style="width: 100%"></app-common-input>
    </ng-template>

    <ng-template let-item #dateTpl>
      <app-date-value-handler [formControl]="item"></app-date-value-handler>
    </ng-template>

    <ng-template let-item #timeTpl>
      <app-time-value-2 [control]="item"></app-time-value-2>
    </ng-template>

    <ng-template let-item #intervalTpl>
      <app-interval-value-2 [control]="item"></app-interval-value-2>
    </ng-template>

    <ng-template let-item #listTpl>
      <app-list-value-2 [propertyDef]="resPropDef" [control]="item" style="flex: 1"></app-list-value-2>
    </ng-template>

    <ng-template let-item #geoNameTpl>
      <app-geoname-value-2 [control]="item" style="width: 100%"></app-geoname-value-2>
    </ng-template>

    <ng-template let-item #linkTpl>
      <app-link-value-2
        [control]="item"
        style="width: 100%"
        [propIri]="property.propertyDefinition.id"></app-link-value-2>
    </ng-template>

    <ng-template let-item #uriTpl>
      <app-uri-value-2 [control]="item" style="width: 100%"></app-uri-value-2>
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
  @Input() propertyDefinition!: PropertyDefinition;
  @Input() cardinality!: Cardinality;
  @Input() formArray!: FormArray;
  @Input() property!: IHasPropertyWithPropertyDefinition; // TODO remove later ?

  @ViewChild('intTpl') intTpl!: TemplateRef<any>;
  @ViewChild('decimalTpl') decimalTpl!: TemplateRef<any>;
  @ViewChild('booleanTpl') booleanTpl!: TemplateRef<any>;
  @ViewChild('colorTpl') colorTpl!: TemplateRef<any>;
  @ViewChild('textTpl') textTpl!: TemplateRef<any>;
  @ViewChild('dateTpl') dateTpl!: TemplateRef<any>;
  @ViewChild('timeTpl') timeTpl!: TemplateRef<any>;
  @ViewChild('intervalTpl') intervalTpl!: TemplateRef<any>;
  @ViewChild('listTpl') listTpl!: TemplateRef<any>;
  @ViewChild('geoNameTpl') geoNameTpl!: TemplateRef<any>;
  @ViewChild('linkTpl') linkTpl!: TemplateRef<any>;
  @ViewChild('uriTpl') uriTpl!: TemplateRef<any>;
  @ViewChild('defaultTpl') defaultTpl!: TemplateRef<any>;

  itemTpl!: TemplateRef<any>;
  newValue: any;
  validators: ValidatorFn[] | undefined;

  get resPropDef() {
    return this.propertyDefinition as ResourcePropertyDefinition;
  }

  constructor(private _cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const data = this.getTemplate();
    this.itemTpl = data.template;
    this.newValue = data.newValue;
    this.validators = data.validators;
    this._cd.detectChanges();
  }

  addItem() {
    this.formArray.push(new FormControl(this.newValue, [Validators.required, ...(this.validators ?? [])]));
  }

  private getTemplate(): { template: TemplateRef<any>; newValue: any; validators?: ValidatorFn[] } {
    switch (this.propertyDefinition.objectType) {
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
        return { template: this.timeTpl, newValue: { date: null, time: null } };
      case Constants.IntervalValue:
        return { template: this.intervalTpl, newValue: { start: null, end: null } };
      case Constants.ListValue:
        return { template: this.listTpl, newValue: null };
      case Constants.GeonameValue:
        return { template: this.geoNameTpl, newValue: '' };
      case Constants.LinkValue:
        return {
          template: this.linkTpl,
          newValue: null,
          validators: [Validators.pattern(/http:\/\/rdfh.ch\/.*/)],
        };
      case Constants.UriValue:
        return { template: this.uriTpl, newValue: '', validators: [Validators.pattern(CustomRegex.URI_REGEX)] };
      default:
        return { template: this.defaultTpl, newValue: null };
    }
  }
}
