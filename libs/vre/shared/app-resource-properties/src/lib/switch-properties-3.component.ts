import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn } from '@angular/forms';
import {
  Cardinality,
  Constants,
  IHasPropertyWithPropertyDefinition,
  PropertyDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { FormValueArray } from './form-value-array.type';
import { NuListService } from './nu-list.service';

@Component({
  selector: 'app-switch-properties-3',
  providers: [NuListService],
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

    <ng-template let-item="item" let-displayMode="displayMode" #textTpl>
      <app-text-switch [control]="item" [displayMode]="displayMode"></app-text-switch>
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
export class SwitchProperties3Component implements OnInit, AfterViewInit {
  @Input() propertyDefinition!: PropertyDefinition;
  @Input() cardinality!: Cardinality;
  @Input() formArray!: FormValueArray;
  @Input() property!: IHasPropertyWithPropertyDefinition; // TODO remove later ?
  @Input() canUpdateForm = false;
  @Input() keepEditMode!: boolean;
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
  validators: ValidatorFn[] | undefined;

  get resPropDef() {
    return this.propertyDefinition as ResourcePropertyDefinition;
  }

  constructor(
    private _cd: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _nuListService: NuListService
  ) {}

  ngOnInit() {
    this._nuListService.keepEditMode = this.keepEditMode;
  }

  ngAfterViewInit() {
    this.itemTpl = this._getTemplate();
    this._cd.detectChanges();
  }

  addItem() {
    this.formArray.push(
      this._fb.group({
        item: propertiesTypeMapping.get(this.propertyDefinition.objectType).control() as AbstractControl,
        comment: this._fb.control(''),
      })
    );
    this._nuListService.toggle(this.formArray.length - 1);
  }

  private _getTemplate(): TemplateRef<any> {
    switch (this.propertyDefinition.objectType) {
      case Constants.IntValue:
        return this.intTpl;
      case Constants.DecimalValue:
        return this.decimalTpl;
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
