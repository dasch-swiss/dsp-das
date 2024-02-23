import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Constants } from '@dasch-swiss/dsp-js';
import { StringLiteralV2 } from '@dasch-swiss/vre/open-api';
import { DefaultProperties, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { Subscription } from 'rxjs';

type MULTIFORM_LANGUAGES = 'de' | 'fr' | 'it' | 'en' | 'rm';
export type MultiLanguageForm = FormArray<
  FormGroup<{
    language: FormControl<MULTIFORM_LANGUAGES>;
    value: FormControl<string>;
  }>
>;
export const DEFAULT_MULTILANGUAGE_FORM = (
  data: StringLiteralV2[] = [{ language: 'de', value: '' }],
  validators?: ValidatorFn[]
) => {
  return new FormArray(
    data.map(
      item =>
        new FormGroup({
          language: new FormControl<MULTIFORM_LANGUAGES>(item.language as MULTIFORM_LANGUAGES),
          value: new FormControl(item.value, { validators }),
        })
    )
  );
};

export type PropertyForm = FormGroup<{
  propType: FormControl<string>;
  name: FormControl<string>;
  labels: MultiLanguageForm;
  comments: MultiLanguageForm;
  guiAttr: FormControl<string>;
}>;

@Component({
  selector: 'app-property-form-2',
  template: ` <form [formGroup]="form">
    <mat-form-field style="width: 100%">
      <span matPrefix>
        <mat-icon>{{ selectedProperty.icon }}</mat-icon>
      </span>
      <mat-label>Property type</mat-label>
      <!-- in case of edit property, the user can change the property type within the same group -->
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
      <!--TODO <mat-hint *ngIf="unsupportedPropertyType" class="ontology-warning-with-prefix">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {{ propertyForm.controls['propType'].value.description }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </mat-hint>-->
    </mat-form-field>
    <app-common-input
      placeholder="Property name *"
      prefixIcon="fingerprint"
      [formGroup]="form"
      controlName="name"></app-common-input>
    <dasch-swiss-multi-language-input
      [formGroup]="form"
      controlName="labels"
      placeholder="Property label*"></dasch-swiss-multi-language-input>
    <dasch-swiss-multi-language-textarea
      [formGroup]="form"
      controlName="comments"
      placeholder="Comment"></dasch-swiss-multi-language-textarea>

    <app-gui-attr-list
      *ngIf="formData.property.propType.objectType === Constants.ListValue"
      [control]="form.controls.guiAttr"></app-gui-attr-list>

    <app-gui-attr-link
      *ngIf="formData.property.propType.objectType === Constants.LinkValue"
      [control]="form.controls.guiAttr"></app-gui-attr-link>
  </form>`,
})
export class PropertyForm2Component implements OnInit, OnDestroy {
  @Input() creationMode: boolean;
  @Input() formData: {
    name?: string;
    labels?: StringLiteralV2[];
    comments?: StringLiteralV2[];
    property: PropertyInfoObject;
    guiAttribute?: string;
  };
  @Output() formValueChange = new EventEmitter<PropertyForm>();

  readonly Constants = Constants;
  readonly defaultProperties = DefaultProperties.data;
  subscription: Subscription;
  form: PropertyForm;

  get selectedProperty() {
    return this.defaultProperties.flatMap(el => el.elements).find(e => e.guiEle === this.form.controls.propType.value);
  }

  get filteredProperties() {
    return this.defaultProperties.filter(property => property.group === this.formData.property.propType.group);
  }

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      propType: this._fb.control({
        value: this.formData.property.propType.guiEle,
        disabled: this.creationMode || this.filteredProperties[0].elements.length === 1,
      }),
      name: this._fb.control<string>({ value: this.formData.name ?? '', disabled: !this.creationMode }, [
        Validators.required,
      ]),
      labels: DEFAULT_MULTILANGUAGE_FORM(this.formData.labels, [Validators.required]),
      comments: DEFAULT_MULTILANGUAGE_FORM(this.formData.comments, [Validators.required]),
      guiAttr: this._fb.control<string>({ value: this.formData.guiAttribute, disabled: !this.creationMode }, [
        Validators.required,
      ]),
    });

    this.subscription = this.form.valueChanges.subscribe(() => {
      this.formValueChange.emit(this.form);
    });
    this.formValueChange.emit(this.form);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
