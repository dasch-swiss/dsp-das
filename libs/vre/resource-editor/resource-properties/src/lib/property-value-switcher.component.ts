import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import {
  Constants,
  ReadResource,
  ReadTextValueAsHtml,
  ReadTextValueAsString,
  ReadTextValueAsXml,
  ReadValue,
} from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { JsLibPotentialError } from './JsLibPotentialError';
import { FormValueArray } from './form-value-array.type';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value-switcher',
  providers: [PropertyValueService],
  template: `
    <app-property-values [itemTpl]="itemTpl" />

    <ng-template #intTpl let-item="item" let-displayMode="displayMode">
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <mat-form-field style="width: 100%">
          <input matInput [formControl]="item" type="number" data-cy="int-input" />
          <mat-error *ngIf="item.errors as errors">
            {{ errors | humanReadableError }}
          </mat-error>
        </mat-form-field>
      </app-base-switch>
    </ng-template>

    <ng-template #decimalTpl let-item="item" let-displayMode="displayMode">
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <mat-form-field style="width: 100%">
          <input matInput [formControl]="item" type="number" step="0.05" />
        </mat-form-field>
      </app-base-switch>
    </ng-template>

    <ng-template #booleanTpl let-item="item" let-displayMode="displayMode">
      <app-toggle-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #listTpl let-item="item" let-displayMode="displayMode">
      <app-list-switch [control]="item" [displayMode]="displayMode" [propertyDef]="propertyDefinition" />
    </ng-template>

    <ng-template #colorTpl let-item="item" let-displayMode="displayMode">
      <app-color-switch [control]="item" style="flex: 1" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #richTextTpl let-item="item" let-displayMode="displayMode">
      <app-rich-text-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #textTpl let-item="item" let-displayMode="displayMode">
      <app-text-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #textHtmlTpl let-item="item" let-displayMode="displayMode">
      <app-text-html-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #paragraphTpl let-item="item" let-displayMode="displayMode">
      <app-base-switch [control]="item" [displayMode]="displayMode">
        <mat-form-field style="width: 100%">
          <textarea matInput [formControl]="item" rows="9" placeholder="Text value"></textarea>
        </mat-form-field>
      </app-base-switch>
    </ng-template>

    <ng-template #dateTpl let-item="item" let-displayMode="displayMode">
      <app-date-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #timeTpl let-item="item" let-displayMode="displayMode">
      <app-time-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #intervalTpl let-item="item" let-displayMode="displayMode">
      <app-interval-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #geoNameTpl let-item="item" let-displayMode="displayMode">
      <app-geoname-switch [control]="item" [displayMode]="displayMode" />
    </ng-template>

    <ng-template #linkTpl let-item="item" let-displayMode="displayMode">
      <app-link-switch
        [control]="item"
        [displayMode]="displayMode"
        [propIri]="propertyDefinition.id"
        [values]="editModeData?.values"
        [resourceClassIri]="resourceClassIri" />
    </ng-template>

    <ng-template #uriTpl let-item="item" let-displayMode="displayMode">
      <app-uri-switch [control]="item" [displayMode]="displayMode" style="width: 100%" />
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
export class PropertyValueSwitcherComponent implements OnInit, OnChanges, AfterViewInit {
  @Input({ required: true }) formArray!: FormValueArray;
  @Input() editModeData: { resource: ReadResource; values: ReadValue[] } | null = null;
  @Input({ required: true }) resourceClassIri!: string;

  @Input({ required: true }) myProperty!: PropertyInfoValues;

  get cardinality() {
    return this.myProperty.guiDef.cardinality;
  }

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  @ViewChild('intTpl') intTpl!: TemplateRef<any>;
  @ViewChild('decimalTpl') decimalTpl!: TemplateRef<any>;
  @ViewChild('booleanTpl') booleanTpl!: TemplateRef<any>;
  @ViewChild('colorTpl') colorTpl!: TemplateRef<any>;
  @ViewChild('textTpl') textTpl!: TemplateRef<any>;
  @ViewChild('textHtmlTpl') textHtmlTpl!: TemplateRef<any>;
  @ViewChild('paragraphTpl') paragraphTpl!: TemplateRef<any>;
  @ViewChild('richTextTpl') richTextTpl!: TemplateRef<any>;
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

  constructor(
    private _propertyValueService: PropertyValueService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._setupData();
  }

  _setupData() {
    this._propertyValueService.editModeData = this.editModeData;
    this._propertyValueService.propertyDefinition = this.propertyDefinition;
    this._propertyValueService.formArray = this.formArray;
    this._propertyValueService.cardinality = this.cardinality;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.itemTpl = this._getTemplate();
    if (changes['editModeData']) {
      this._setupData();
    }
  }

  ngAfterViewInit() {
    this.itemTpl = this._getTemplate();
    this._cd.detectChanges();
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
        return this._manageTextValue();
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
      default: {
        throw Error(`Unrecognized property ${this.propertyDefinition.objectType}`);
      }
    }
  }

  private _manageTextValue() {
    if (this.myProperty.values.length === 0) {
      return this._defaultTextBehavior();
    }

    const value = this.myProperty.values[0] as ReadTextValueAsString | ReadTextValueAsXml | ReadTextValueAsHtml;

    if (value instanceof ReadTextValueAsString) {
      return this._defaultTextBehavior();
    }

    if (value instanceof ReadTextValueAsXml && value.mapping === Constants.StandardMapping) {
      return this.richTextTpl;
    }

    if (value instanceof ReadTextValueAsHtml) {
      return this.textHtmlTpl;
    }

    throw new Error('The text value is not supported');
  }

  private _defaultTextBehavior() {
    switch (this.propertyDefinition.guiElement) {
      case Constants.GuiRichText:
        return this.richTextTpl;
      case Constants.GuiTextarea:
        return this.paragraphTpl;
      default:
        return this.textTpl;
    }
  }
}
