import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import {
  Cardinality,
  Constants,
  IHasPropertyWithPropertyDefinition,
  PropertyDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { CustomRegex } from '@dsp-app/src/app/workspace/resource/values/custom-regex';
import { FormValueArray } from './form-value-array.type';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list
      [itemTpl]="itemTpl"
      [formArray]="formArray"
      [cardinality]="cardinality"
      [canUpdateForm]="canUpdateForm"
      (addItem)="addItem()"
      (updatedIndex)="updatedIndex.emit($event)"></app-nu-list>

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
  @Input() formArray!: FormValueArray;
  @Input() property!: IHasPropertyWithPropertyDefinition; // TODO remove later ?
  @Input() defaultControlValue: unknown;
  @Input() canUpdateForm = false;
  @Output() updatedIndex = new EventEmitter<number>();
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
  newControl: any;
  validators: ValidatorFn[] | undefined;

  get resPropDef() {
    return this.propertyDefinition as ResourcePropertyDefinition;
  }

  constructor(
    private _cd: ChangeDetectorRef,
    private _fb: FormBuilder
  ) {}

  ngAfterViewInit() {
    const data = this.getTemplate(this.defaultControlValue);
    this.itemTpl = data.template;
    this.newControl = data.newValue;
    this._cd.detectChanges();
  }

  addItem() {
    const data = this.getTemplate();
    this.formArray.push(
      this._fb.group({
        item: data.newValue,
        comment: new FormControl(''),
      })
    );
  }

  private getTemplate(newValue?: unknown): { template: TemplateRef<any>; newValue: AbstractControl } {
    const mapping = new Map<string, (value?: any) => AbstractControl>([
      [Constants.IntValue, (value: number) => new FormControl(value ?? 0, Validators.required)],
      [Constants.DecimalValue, (value: number) => new FormControl(value ?? 0, Validators.required)],
      [Constants.BooleanValue, (value: number) => new FormControl(value ?? 0, Validators.required)],
    ]);
    switch (this.propertyDefinition.objectType) {
      case Constants.IntValue:
        return { template: this.intTpl, newValue: this._fb.control(newValue ?? 0, Validators.required) };
      case Constants.DecimalValue:
        return { template: this.decimalTpl, newValue: this._fb.control(0, Validators.required) };
      case Constants.BooleanValue:
        return { template: this.booleanTpl, newValue: this._fb.control(false, Validators.required) };
      case Constants.ColorValue:
        return { template: this.colorTpl, newValue: this._fb.control('#000000', Validators.required) };
      case Constants.TextValue:
        return { template: this.textTpl, newValue: this._fb.control(newValue ?? '', Validators.required) };
      case Constants.DateValue:
        return { template: this.dateTpl, newValue: this._fb.control('', Validators.required) };
      case Constants.TimeValue:
        return {
          template: this.timeTpl,
          newValue: this._fb.group({
            date: this._fb.control(null, Validators.required),
            time: this._fb.control(null, Validators.required),
          }),
        };
      case Constants.IntervalValue:
        return {
          template: this.intervalTpl,
          newValue: this._fb.group({
            start: this._fb.control(0, Validators.required),
            end: this._fb.control(0, Validators.required),
          }),
        };
      case Constants.ListValue:
        return { template: this.listTpl, newValue: this._fb.control(null, Validators.required) };
      case Constants.GeonameValue:
        return { template: this.geoNameTpl, newValue: this._fb.control('', Validators.required) };
      case Constants.LinkValue:
        return {
          template: this.linkTpl,
          newValue: this._fb.control(null, [Validators.required, Validators.pattern(/http:\/\/rdfh.ch\/.*/)]),
        };
      case Constants.UriValue:
        return {
          template: this.uriTpl,
          newValue: this._fb.control('', [Validators.required, Validators.pattern(CustomRegex.URI_REGEX)]),
        };
      default:
        throw Error('Unrecognized property');
    }
  }
}
