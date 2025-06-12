import { AfterViewInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  Constants,
  PropertyDefinition,
  ReadTextValueAsHtml,
  ReadTextValueAsString,
  ReadTextValueAsXml,
  ReadValue,
} from '@dasch-swiss/dsp-js';
import { JsLibPotentialError } from './JsLibPotentialError';

@Component({
  selector: 'app-template-switcher',
  template: `
    <ng-template #intEditorTpl let-item="item">
      <mat-form-field style="width: 100%">
        <input matInput [formControl]="item" type="number" data-cy="int-input" />
        <mat-error *ngIf="item.errors as errors">
          {{ errors | humanReadableError }}
        </mat-error>
      </mat-form-field>
    </ng-template>

    <ng-template #decimalEditorTpl let-item="item">
      <mat-form-field style="width: 100%">
        <input matInput [formControl]="item" type="number" step="0.05" />
      </mat-form-field>
    </ng-template>

    <ng-template #booleanEditorTpl let-item="item">
      <app-toggle-switch [control]="item" [displayMode]="false" />
    </ng-template>

    <ng-template #listEditorTpl let-item="item">
      <app-list-value [control]="item" [propertyDef]="propertyDefinition" />
    </ng-template>

    <ng-template #colorEditorTpl let-control="item">
      <mat-form-field appearance="outline" style="cursor: pointer">
        <mat-label>{{ control.value }}</mat-label>
        <!-- check the ngx-color-picker doc to know more about the options - https://www.npmjs.com/package/ngx-color-picker -->
        <input
          data-cy="color-picker-input"
          matInput
          placeholder="Select a color"
          class="color-picker-input color"
          [formControl]="control"
          [colorPicker]="control.value"
          [style.background]="control.value"
          [style.color]="control.value"
          (colorPickerChange)="control.patchValue($event)"
          [cpOutputFormat]="'hex'"
          [cpFallbackColor]="'#ff0000'"
          [cpDisabled]="false"
          style="cursor: pointer"
          readonly />
      </mat-form-field>
    </ng-template>

    <ng-template #richTextEditorTpl let-item="item">
      <app-ck-editor [control]="item" />
    </ng-template>

    <ng-template #textEditorTpl let-item="item">
      <app-common-input [control]="item" style="width: 100%" data-cy="text-input" label="Text value" />
    </ng-template>

    <ng-template #textHtmlEditorTpl>This value cannot be edited.</ng-template>

    <ng-template #paragraphEditorTpl let-item="item">
      <mat-form-field style="width: 100%">
        <textarea matInput [formControl]="item" rows="9" placeholder="Text value"></textarea>
      </mat-form-field>
    </ng-template>

    <ng-template #dateEditorTpl let-control="item">
      <app-date-value-handler [formControl]="control" />
      <mat-error *ngIf="control.touched && control.errors as errors">{{ errors | humanReadableError }}</mat-error>
    </ng-template>

    <ng-template #timeEditorTpl let-item="item">
      <app-time-value [control]="item" />
    </ng-template>

    <ng-template #intervalEditorTpl let-item="item">
      <app-interval-value [control]="item" />
    </ng-template>

    <ng-template #geoNameEditorTpl let-item="item">
      <app-geoname-value [control]="item" />
    </ng-template>

    <ng-template #linkEditorTpl let-item="item">
      <app-link-value [control]="item" [defaultValue]="''" [propIri]="''" [resourceClassIri]="''" />
    </ng-template>
    <!-- VIEWERS -->
    <ng-template #basicDisplayTpl let-item="item">
      <span>{{ item.value }}</span>
    </ng-template>

    <ng-template #booleanDisplayTpl let-item="item">
      <mat-slide-toggle *ngIf="item.value !== null" [checked]="item.value" [disabled]="true" />
    </ng-template>

    <ng-template #intervalDisplayTpl let-item="item">
      <app-interval-viewer [control]="item" />
    </ng-template>

    <ng-template #timeDisplayTpl let-item="item">
      <app-time-viewer [control]="item" />
    </ng-template>

    <ng-template #listDisplayTpl let-item="item">
      <app-list-viewer [control]="item" [propertyDef]="propertyDefinition" />
    </ng-template>

    <ng-template #defaultDisplayTpl><span style="width: 100%">Nothing to show</span></ng-template>
  `,
})
export class TemplateSwitcherComponent implements AfterViewInit {
  @Input({ required: true }) value!: ReadValue | undefined;
  @Input({ required: true }) myPropertyDefinition!: PropertyDefinition;
  @Input({ required: true }) editMode!: boolean;
  @Output() templateFound = new EventEmitter<TemplateRef<any>>();

  @ViewChild('intEditorTpl') intEditorTpl!: TemplateRef<any>;
  @ViewChild('decimalEditorTpl') decimalEditorTpl!: TemplateRef<any>;
  @ViewChild('booleanEditorTpl') booleanEditorTpl!: TemplateRef<any>;
  @ViewChild('colorEditorTpl') colorEditorTpl!: TemplateRef<any>;
  @ViewChild('textEditorTpl') textEditorTpl!: TemplateRef<any>;
  @ViewChild('textHtmlEditorTpl') textHtmlEditorTpl!: TemplateRef<any>;
  @ViewChild('paragraphEditorTpl') paragraphEditorTpl!: TemplateRef<any>;
  @ViewChild('richTextEditorTpl') richTextEditorTpl!: TemplateRef<any>;
  @ViewChild('dateEditorTpl') dateEditorTpl!: TemplateRef<any>;
  @ViewChild('timeEditorTpl') timeEditorTpl!: TemplateRef<any>;
  @ViewChild('intervalEditorTpl') intervalEditorTpl!: TemplateRef<any>;
  @ViewChild('listEditorTpl') listEditorTpl!: TemplateRef<any>;
  @ViewChild('geoNameEditorTpl') geoNameEditorTpl!: TemplateRef<any>;
  @ViewChild('linkEditorTpl') linkEditorTpl!: TemplateRef<any>;
  @ViewChild('uriEditorTpl') uriEditorTpl!: TemplateRef<any>;

  @ViewChild('decimalDisplayTpl') decimalDisplayTpl!: TemplateRef<any>;
  @ViewChild('booleanDisplayTpl') booleanDisplayTpl!: TemplateRef<any>;
  @ViewChild('colorDisplayTpl') colorDisplayTpl!: TemplateRef<any>;
  @ViewChild('textDisplayTpl') textDisplayTpl!: TemplateRef<any>;
  @ViewChild('textHtmlDisplayTpl') textHtmlDisplayTpl!: TemplateRef<any>;
  @ViewChild('paragraphDisplayTpl') paragraphDisplayTpl!: TemplateRef<any>;
  @ViewChild('richTextDisplayTpl') richTextDisplayTpl!: TemplateRef<any>;
  @ViewChild('dateDisplayTpl') dateDisplayTpl!: TemplateRef<any>;
  @ViewChild('timeDisplayTpl') timeDisplayTpl!: TemplateRef<any>;
  @ViewChild('intervalDisplayTpl') intervalDisplayTpl!: TemplateRef<any>;
  @ViewChild('listDisplayTpl') listDisplayTpl!: TemplateRef<any>;
  @ViewChild('geoNameDisplayTpl') geoNameDisplayTpl!: TemplateRef<any>;
  @ViewChild('linkDisplayTpl') linkDisplayTpl!: TemplateRef<any>;
  @ViewChild('uriDisplayTpl') uriDisplayTpl!: TemplateRef<any>;

  @ViewChild('basicDisplayTpl') basicDisplayTpl!: TemplateRef<any>;
  @ViewChild('defaultDisplayTpl') defaultDisplayTpl!: TemplateRef<any>;

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myPropertyDefinition);
  }

  ngAfterViewInit() {
    this.templateFound.emit(this.editMode ? this._getEditorTemplate() : this._getDisplayTemplate());
  }

  private _getEditorTemplate(): TemplateRef<any> {
    switch (this.propertyDefinition.objectType) {
      case Constants.IntValue:
        return this.intEditorTpl;
      case Constants.DecimalValue:
        return this.decimalEditorTpl;
      case Constants.BooleanValue:
        return this.booleanEditorTpl;
      case Constants.ColorValue:
        return this.colorEditorTpl;
      case Constants.TextValue:
        return this._manageTextEditorValue();
      case Constants.DateValue:
        return this.dateEditorTpl;
      case Constants.TimeValue:
        return this.timeEditorTpl;
      case Constants.IntervalValue:
        return this.intervalEditorTpl;
      case Constants.ListValue:
        return this.listEditorTpl;
      case Constants.GeonameValue:
        return this.geoNameEditorTpl;
      case Constants.LinkValue:
        return this.linkEditorTpl;
      case Constants.UriValue:
        return this.uriEditorTpl;
      default: {
        throw Error(`Unrecognized property ${this.propertyDefinition.objectType}`);
      }
    }
  }

  private _getDisplayTemplate(): TemplateRef<any> {
    switch (this.propertyDefinition.objectType) {
      case Constants.IntValue:
        return this.basicDisplayTpl;
      case Constants.DecimalValue:
        return this.decimalDisplayTpl;
      case Constants.BooleanValue:
        return this.booleanDisplayTpl;
      case Constants.ColorValue:
        return this.colorDisplayTpl;
      case Constants.TextValue:
        return this._manageTextDisplayValue();
      case Constants.DateValue:
        return this.dateDisplayTpl;
      case Constants.TimeValue:
        return this.timeDisplayTpl;
      case Constants.IntervalValue:
        return this.intervalDisplayTpl;
      case Constants.ListValue:
        return this.listDisplayTpl;
      case Constants.GeonameValue:
        return this.geoNameDisplayTpl;
      case Constants.LinkValue:
        return this.linkDisplayTpl;
      case Constants.UriValue:
        return this.uriDisplayTpl;
      default: {
        throw Error(`Unrecognized property ${this.propertyDefinition.objectType}`);
      }
    }
  }

  private _manageTextEditorValue() {
    console.log('a', this);
    if (this.value === undefined) {
      return this._defaultTextEditorBehavior();
    }

    const value = this.value as ReadTextValueAsString | ReadTextValueAsXml | ReadTextValueAsHtml;

    if (value instanceof ReadTextValueAsString) {
      return this._defaultTextEditorBehavior();
    }

    if (value instanceof ReadTextValueAsXml && value.mapping === Constants.StandardMapping) {
      return this.richTextEditorTpl;
    }

    if (value instanceof ReadTextValueAsHtml) {
      return this.textHtmlEditorTpl;
    }

    throw new Error('The text value is not supported');
  }

  private _defaultTextEditorBehavior() {
    switch (this.propertyDefinition.guiElement) {
      case Constants.GuiRichText:
        return this.richTextEditorTpl;
      case Constants.GuiTextarea:
        return this.paragraphEditorTpl;
      default:
        return this.textEditorTpl;
    }
  }

  private _manageTextDisplayValue() {
    if (this.value === undefined) {
      return this._defaultTextDisplayBehavior();
    }

    const value = this.value as ReadTextValueAsString | ReadTextValueAsXml | ReadTextValueAsHtml;

    if (value instanceof ReadTextValueAsString) {
      return this._defaultTextDisplayBehavior();
    }

    if (value instanceof ReadTextValueAsXml && value.mapping === Constants.StandardMapping) {
      return this.richTextDisplayTpl;
    }

    if (value instanceof ReadTextValueAsHtml) {
      return this.textHtmlDisplayTpl;
    }

    throw new Error('The text value is not supported');
  }

  private _defaultTextDisplayBehavior() {
    switch (this.propertyDefinition.guiElement) {
      case Constants.GuiRichText:
        return this.richTextDisplayTpl;
      case Constants.GuiTextarea:
        return this.paragraphDisplayTpl;
      default:
        return this.textEditorTpl;
    }
  }
}
