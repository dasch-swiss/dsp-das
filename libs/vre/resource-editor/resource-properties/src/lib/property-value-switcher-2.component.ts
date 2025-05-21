import { AfterViewInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Constants, ReadTextValueAsHtml, ReadTextValueAsString, ReadTextValueAsXml } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-property-value-switcher-2',
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
      <!-- TODO -->
    </ng-template>

    <ng-template #listEditorTpl let-item="item">
      <!-- TODO -->
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

    <ng-template #textHtmlEditorTpl> This value cannot be edited.</ng-template>

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
      <!-- TODO -->
    </ng-template>

    <ng-template #geoNameEditorTpl let-item="item">
      <app-geoname-value [control]="item" />
    </ng-template>

    <ng-template #linkTpl let-item="item">
      <!-- TODO -->
    </ng-template>

    <ng-template #uriTpl let-item="item">
      <!-- TODO -->
    </ng-template>

    <!-- VIEWERS -->
    <ng-template #textTpl let-item="item">
      <span>{{ item.value }}</span>
    </ng-template>

    <ng-template #defaultTpl><span style="width: 100%">Nothing to show</span></ng-template>
  `,
})
export class PropertyValueSwitcher2Component implements AfterViewInit {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
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

  @ViewChild('intDisplayTpl') intDisplayTpl!: TemplateRef<any>;
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
  @ViewChild('defaultDisplayTpl') defaultDisplayTpl!: TemplateRef<any>;

  get propertyDefinition() {
    // TODO NEEDED?
    return this.myProperty.propDef;
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
        return this.intDisplayTpl;
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
    if (this.myProperty.values.length === 0) {
      return this._defaultTextEditorBehavior();
    }

    const value = this.myProperty.values[0] as ReadTextValueAsString | ReadTextValueAsXml | ReadTextValueAsHtml;

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
    // TODO !!
    return this.defaultDisplayTpl;
  }
}
