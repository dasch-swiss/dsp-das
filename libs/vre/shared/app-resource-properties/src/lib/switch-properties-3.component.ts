import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import {
  Cardinality,
  Constants,
  IHasPropertyWithPropertyDefinition,
  PropertyDefinition,
  ReadResource,
  ReadValue,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { FormValueArray } from './form-value-array.type';
import { NuListService } from './nu-list.service';

@Component({
  selector: 'app-switch-properties-3',
  providers: [NuListService],
  template: `
    <app-nu-list [itemTpl]="itemTpl"></app-nu-list>

    <ng-template let-item #intTpl let-displayMode="displayMode">
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <app-common-input type="number" [control]="item"></app-common-input>
      </app-base-switch>
    </ng-template>

    <ng-template let-item #booleanTpl let-displayMode="displayMode">
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <mat-slide-toggle [formControl]="item"></mat-slide-toggle>
      </app-base-switch>
    </ng-template>

    <ng-template let-item #colorTpl let-displayMode="displayMode">
      <app-color-switch [control]="item" style="flex: 1" [displayMode]="displayMode"></app-color-switch>
    </ng-template>

    <ng-template let-item="item" let-displayMode="displayMode" #textTpl>
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <app-common-input [control]="item" style="width: 100%"></app-common-input>
      </app-base-switch>
    </ng-template>

    <ng-template #dateTpl let-item let-displayMode="displayMode">
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <app-date-value-handler [formControl]="item"></app-date-value-handler>
      </app-base-switch>
    </ng-template>

    <ng-template #timeTpl let-item let-displayMode="displayMode">
      <app-time-switch [control]="item" [displayMode]="displayMode"></app-time-switch>
    </ng-template>

    <ng-template #intervalTpl let-item let-displayMode="displayMode">
      <app-interval-switch [control]="item"></app-interval-switch>
    </ng-template>

    <ng-template let-item #listTpl>
      <app-list-value-2 [propertyDef]="resPropDef" [control]="item" style="flex: 1"></app-list-value-2>
    </ng-template>

    <ng-template #geoNameTpl let-item let-displayMode="displayMode">
      <app-geoname-switch [control]="item"></app-geoname-switch>
    </ng-template>

    <ng-template #linkTpl let-item let-displayMode="displayMode">
      <app-link-switch [control]="item" [displayMode]="displayMode"></app-link-switch>
    </ng-template>

    <ng-template let-item #uriTpl>
      <app-uri-switch [control]="item" style="width: 100%"></app-uri-switch>
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
export class SwitchProperties3Component implements OnInit, AfterViewInit {
  @Input() propertyDefinition!: PropertyDefinition;
  @Input() cardinality!: Cardinality;
  @Input() formArray!: FormValueArray;
  @Input() property!: IHasPropertyWithPropertyDefinition; // TODO remove later ?
  @Input() editModeData: { resource: ReadResource; values: ReadValue[] } | null = null;
  @ViewChild('intTpl') intTpl!: TemplateRef<any>;
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
  validators: ValidatorFn[] | undefined;

  get resPropDef() {
    return this.propertyDefinition as ResourcePropertyDefinition;
  }

  constructor(
    private _cd: ChangeDetectorRef,
    private _nuListService: NuListService
  ) {}

  ngOnInit() {
    this._nuListService._editModeData = this.editModeData;
    this._nuListService.propertyDefinition = this.propertyDefinition;
    this._nuListService.formArray = this.formArray;
    this._nuListService.cardinality = this.cardinality;
  }

  ngAfterViewInit() {
    this.itemTpl = this._getTemplate();
    this._cd.detectChanges();
  }

  private _getTemplate(): TemplateRef<any> {
    switch (this.propertyDefinition.objectType) {
      case Constants.IntValue:
      case Constants.DecimalValue:
        return this.intTpl;
      case Constants.BooleanValue:
        return this.booleanTpl;
      case Constants.ColorValue:
        return this.colorTpl;
      case Constants.TextValue:
        return this.textTpl;
      case Constants.DateValue:
        return this.dateTpl;
      case Constants.TimeValue:
        return this.timeTpl;
      case Constants.IntervalValue:
        return this.intervalTpl;
      case Constants.ListValue:
        return this.listTpl;
      case Constants.GeonameValue:
        return this.geoNameTpl;
      case Constants.LinkValue:
        return this.linkTpl;
      case Constants.UriValue:
        return this.uriTpl;
      default:
        throw Error('Unrecognized property');
    }
  }
}
