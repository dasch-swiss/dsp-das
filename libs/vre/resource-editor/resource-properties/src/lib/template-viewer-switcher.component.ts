import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
  selector: 'app-template-viewer-switcher',
  template: `
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

    <ng-template #richTextDisplayTpl let-item="item">
      <app-rich-text-viewer [control]="item" />
    </ng-template>

    <ng-template #textHtmlDisplayTpl let-item="item">
      <div data-cy="text-html-switch" [innerHTML]="item.value | internalLinkReplacer | addTargetBlank" appMathjax></div>
    </ng-template>

    <ng-template #colorDisplayTpl let-item="item">
      <div
        style="width: 100px; border-radius: 4px; height: 15px; margin: 4px 0; border: 1px solid;"
        data-cy="color-box"
        [style.background-color]="item.value"></div>
    </ng-template>

    <ng-template #dateDisplayTpl let-item="item">
      <app-date-viewer [control]="item" />
    </ng-template>

    <ng-template #geoNameDisplayTpl let-item="item">
      <app-geoname-viewer [control]="item" />
    </ng-template>

    <ng-template #linkDisplayTpl let-item="item">
      <app-link-viewer [control]="item" />
    </ng-template>

    <ng-template #defaultDisplayTpl><span style="width: 100%">Nothing to show</span></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateViewerSwitcherComponent implements AfterViewInit {
  @Input({ required: true }) value!: ReadValue | undefined;
  @Input({ required: true }) myPropertyDefinition!: PropertyDefinition;
  @Output() templateFound = new EventEmitter<TemplateRef<any>>();

  @ViewChild('booleanDisplayTpl') booleanDisplayTpl!: TemplateRef<any>;
  @ViewChild('colorDisplayTpl') colorDisplayTpl!: TemplateRef<any>;
  @ViewChild('textHtmlDisplayTpl') textHtmlDisplayTpl!: TemplateRef<any>;
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
    this.templateFound.emit(this._getDisplayTemplate());
  }

  private _getDisplayTemplate(): TemplateRef<any> {
    switch (this.propertyDefinition.objectType) {
      case Constants.IntValue:
      case Constants.DecimalValue:
        return this.basicDisplayTpl;
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
      default:
        return this.basicDisplayTpl;
    }
  }
}
