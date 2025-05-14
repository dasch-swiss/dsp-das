import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Constants } from '@dasch-swiss/dsp-js';
import {
    DefaultProperties, DefaultProperty,
    LocalizationService, OntologyService,
    PropertyCategory
} from '@dasch-swiss/vre/shared/app-helper-services';
import { DEFAULT_MULTILANGUAGE_FORM } from '@dasch-swiss/vre/ui/string-literal';
import { PropertyForm, PropertyData } from '../property-form.type';

@Component({
  selector: 'app-property-form',
  template: ` <form [formGroup]="form">
    <mat-form-field style="width: 100%">
      <span matPrefix>
        <mat-icon>{{ propertyData.propType.icon }}</mat-icon>
      </span>
      <mat-label>Property type</mat-label>
      <mat-select [formControl]="form.controls.guiElement">
        <mat-select-trigger>
          {{ propertyData.propType.group }}
          :&nbsp; {{ propertyData.propType.label }}
        </mat-select-trigger>

        <mat-optgroup *ngFor="let type of filteredProperties" [label]="type.group">
          <mat-option *ngFor="let ele of type.elements" [value]="ele.guiEle">
            <mat-icon>{{ ele.icon }}</mat-icon>
            {{ ele.label }}
          </mat-option>
        </mat-optgroup>
      </mat-select>
    </mat-form-field>
    <app-common-input
      label="Property name"
      data-cy="name-input"
      prefixIcon="fingerprint"
      [disabled]="!!propertyData.name"
      [control]="form.controls.name" />
    <app-multi-language-input
      [formArray]="form.controls.labels"
      [isRequired]="true"
      data-cy="label-input"
      placeholder="Property label" />

    <app-gui-attr-list
      *ngIf="propertyData.propType.objectType === Constants.ListValue"
      [control]="form.controls.guiAttr" />

    <app-gui-attr-link
      *ngIf="propertyData.propType.objectType === Constants.LinkValue"
      [control]="form.controls.guiAttr" />

    <app-multi-language-textarea
      [formArray]="form.controls.comments"
      data-cy="comment-textarea"
      placeholder="Comment"
      [isRequired]="true" />
  </form>`,
})
export class PropertyFormComponent implements OnInit {
  @Input() propertyData!: PropertyData;
  @Output() afterFormInit = new EventEmitter<PropertyForm>();

  readonly Constants = Constants;
  readonly defaultProperties = DefaultProperties.data;

  form!: PropertyForm;

  filteredProperties!: PropertyCategory[];

  constructor(
    private _fb: FormBuilder,
    private _localizationService: LocalizationService
  ) {}

  ngOnInit() {
    this.filteredProperties = this.defaultProperties.filter(
      property => property.group === this.propertyData.propType.group
    );

    const defaultData = [
      {
        language: this._localizationService.getCurrentLanguage(),
        value: '',
      },
    ];
    this.form = this._fb.group({
        guiElement: this._fb.control(
        {
          value: this.propertyData.propType.guiEle!,
          disabled: this.filteredProperties[0].elements.length === 1,
        },
        { nonNullable: true }
      ),
      name: this._fb.control<string>(this.propertyData.name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      labels: DEFAULT_MULTILANGUAGE_FORM(this.propertyData.labels ?? defaultData, [Validators.required]),
      comments: DEFAULT_MULTILANGUAGE_FORM(this.propertyData.comments ?? defaultData, [Validators.required]),
      guiAttr: this._fb.control<string>(
        {
          value: this.propertyData.guiAttribute!,
          disabled: ![Constants.LinkValue, Constants.ListValue].includes(this.propertyData.propType.objectType!),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
    });

    this.afterFormInit.emit(this.form);
  }
}
