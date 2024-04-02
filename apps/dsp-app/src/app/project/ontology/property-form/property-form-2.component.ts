import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Cardinality, Constants } from '@dasch-swiss/dsp-js';
import { StringLiteralV2 } from '@dasch-swiss/vre/open-api';
import { DefaultProperties, PropertyCategory, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { DEFAULT_MULTILANGUAGE_FORM } from '@dasch-swiss/vre/shared/app-string-literal';
import { PropertyForm } from '@dsp-app/src/app/project/ontology/property-form/property-form.type';

@Component({
  selector: 'app-property-form-2',
  template: `
        <form [formGroup]="form">
            <mat-form-field style="width: 100%">
      <span matPrefix>
        <mat-icon>{{ selectedProperty.icon }}</mat-icon>
      </span>
                <mat-label>Property type</mat-label>
                <mat-select [formControl]="form.controls.propType">
                    <mat-select-trigger>
                        {{ selectedProperty.group }}
                        :&nbsp; {{ selectedProperty.label }}
                    </mat-select-trigger>

                    <mat-optgroup *ngFor="let type of filteredProperties" [label]="type.group">
                        <mat-option *ngFor="let ele of type.elements" [value]="ele.guiEle">
                            <mat-icon>{{ ele.icon }}</mat-icon>
                            {{ ele.label }}
                        </mat-option>
                    </mat-optgroup>
                </mat-select>
                {{ propertyForm.controls['propType'].value.description }}
                </mat-hint>-->
            </mat-form-field>
            <app-common-input
                placeholder="Property name *"
                prefixIcon="fingerprint"
                [control]="form.controls.name"></app-common-input>
            <dasch-swiss-multi-language-input
                [formArray]="form.controls.labels"
                placeholder="Property label*"></dasch-swiss-multi-language-input>
            <dasch-swiss-multi-language-textarea
                [formArray]="form.controls.comments"
                placeholder="Comment"></dasch-swiss-multi-language-textarea>

            <app-gui-attr-list
                *ngIf="formData.property.propType.objectType === Constants.ListValue"
                [control]="form.controls.guiAttr"></app-gui-attr-list>

            <app-gui-attr-link
                *ngIf="formData.property.propType.objectType === Constants.LinkValue"
                [control]="form.controls.guiAttr"></app-gui-attr-link>

            <div style="display: flex; justify-content: center; gap: 16px">
                <app-multiple-slide-toggle
                    [control]="form.controls.cardinality"
                    [label]="'Multiple values ?'"></app-multiple-slide-toggle>

                <app-required-slide-toggle
                    [control]="form.controls.cardinality"
                    [label]="'Required value ?'"></app-required-slide-toggle>
            </div>
        </form>`,
})
export class PropertyForm2Component implements OnInit {
  @Input() formData: {
    property: PropertyInfoObject;
    resourceClassId: string;
    name?: string;
    labels?: StringLiteralV2[];
    comments?: StringLiteralV2[];
    guiAttribute?: string;
    cardinality?: Cardinality;
  };
  @Output() afterFormInit = new EventEmitter<PropertyForm>();

  readonly Constants = Constants;
  readonly defaultProperties = DefaultProperties.data;

  form: PropertyForm;

  get selectedProperty() {
    return this.defaultProperties.flatMap(el => el.elements).find(e => e.guiEle === this.form.controls.propType.value);
  }

  filteredProperties: PropertyCategory[];

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.filteredProperties = this.defaultProperties.filter(
      property => property.group === this.formData.property.propType.group
    );

    this.form = this._fb.group({
      propType: this._fb.control({
        value: this.formData.property.propType.guiEle,
        disabled: this.filteredProperties[0].elements.length === 1,
      }),
      name: this._fb.control<string>(this.formData.name ?? '', [Validators.required]),
      labels: DEFAULT_MULTILANGUAGE_FORM(
        this.formData.labels ?? [
          {
            language: 'de',
            value: '',
          },
        ],
        [Validators.required]
      ),
      comments: DEFAULT_MULTILANGUAGE_FORM(
        this.formData.comments ?? [
          {
            language: 'de',
            value: '',
          },
        ],
        [Validators.required]
      ),
      guiAttr: this._fb.control<string>(
        {
          value: this.formData.guiAttribute,
          disabled: true,
        },
        [Validators.required]
      ),
      cardinality: this._fb.control(this.formData.cardinality ?? Cardinality._0_1),
    });

    this.afterFormInit.emit(this.form);
  }
}
