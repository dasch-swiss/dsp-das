import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Cardinality, Constants } from '@dasch-swiss/dsp-js';
import { StringLiteralV2 } from '@dasch-swiss/vre/open-api';
import { DefaultProperties, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { DEFAULT_MULTILANGUAGE_FORM } from '@dasch-swiss/vre/shared/app-string-literal';
import { PropertyForm } from '@dsp-app/src/app/project/ontology/property-form/property-form.type';
import { Subscription } from 'rxjs';

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

    <mat-slide-toggle
      [formControl]="form.controls.cardinality"
      [matTooltip]="'The property in this class can have multiple values'"
      matTooltipPosition="above"
      [checked]="form.controls.cardinality.value.toString().endsWith('n')"
      (change)="toggleMultiple()">
      Multiple values?
    </mat-slide-toggle>

    <mat-slide-toggle
      [formControl]="form.controls.cardinality"
      [matTooltip]="'The property in this class must have one value'"
      matTooltipPosition="above"
      [checked]="form.controls.cardinality.value.toString().startsWith('_1')"
      (change)="toggleRequired()">
      Required field?
    </mat-slide-toggle>
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
    cardinality?: Cardinality;
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
      cardinality: this._fb.control({
        value: this.formData.cardinality,
        disabled: true, // TODO
      }),
    });

    this.subscription = this.form.valueChanges.subscribe(() => {
      this.formValueChange.emit(this.form);
    });
    this.formValueChange.emit(this.form);
  }

  toggleRequired() {
    const requiredToggle = new Map<Cardinality, Cardinality>([
      [Cardinality._1, Cardinality._0_1],
      [Cardinality._0_1, Cardinality._1],
      [Cardinality._0_n, Cardinality._1_n],
      [Cardinality._1_n, Cardinality._0_n],
    ]);
    this.form.controls.cardinality.patchValue(requiredToggle.get(this.form.controls.cardinality.value));
  }

  toggleMultiple() {
    const multipleToggle = new Map<Cardinality, Cardinality>([
      [Cardinality._1, Cardinality._1_n],
      [Cardinality._0_1, Cardinality._0_n],
      [Cardinality._0_n, Cardinality._0_1],
      [Cardinality._1_n, Cardinality._1],
    ]);
    this.form.controls.cardinality.patchValue(multipleToggle.get(this.form.controls.cardinality.value));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
