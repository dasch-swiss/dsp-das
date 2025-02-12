import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClassDefinition, Constants, CreateResourceProperty } from '@dasch-swiss/dsp-js';
import { DefaultProperties, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { OntologyEditService } from '../../../../../pages/ontology/ontology/src/lib/services/ontology-edit.service';
import { PropertyForm } from '../property-form.type';

export interface CreatePropertyFormDialogProps {
  propertyInfo: PropertyInfoObject;
  resClass: ClassDefinition | undefined;
}

@Component({
  selector: 'app-create-property-form-dialog',
  template: ` <app-dialog-header
      title="Create a new property"
      [subtitle]="data.propertyInfo.propType.group + ': ' + data.propertyInfo.propType.label"></app-dialog-header>
    <app-property-form
      mat-dialog-content
      (afterFormInit)="onFormInit($event)"
      [formData]="{ property: data.propertyInfo }"></app-property-form>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        data-cy="submit-button"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form?.invalid"
        (click)="onSubmit()">
        Submit
      </button>
    </div>`,
})
export class CreatePropertyFormDialogComponent implements OnInit {
  loading = false;
  form: PropertyForm;

  constructor(
    private dialogRef: MatDialogRef<CreatePropertyFormDialogComponent, boolean>,
    private _oes: OntologyEditService,
    @Inject(MAT_DIALOG_DATA) public data: CreatePropertyFormDialogProps
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onFormInit(form: PropertyForm) {
    form.controls.propType.disable();
    this.form = form;
  }

  onSubmit() {
    this._oes.createResourceProperty(this.createResourceProperty, this.data.resClass);
    this.dialogRef.close();
  }

  get createResourceProperty(): CreateResourceProperty {
    const createResProp = new CreateResourceProperty();
    createResProp.name = this.form.controls.name.value;
    createResProp.label = this.form.getRawValue().labels;
    createResProp.comment = this.form.getRawValue().comments;

    const guiAttr = this.form.controls.guiAttr.value;
    if (guiAttr) {
      createResProp.guiAttributes = this.getGuiAttribute(guiAttr);
    }
    const selectedProperty = DefaultProperties.data
      .flatMap(el => el.elements)
      .find(
        e =>
          e.guiEle === this.form.controls.propType.value && e.objectType === this.data.propertyInfo.propType.objectType
      );

    if (!selectedProperty) {
      throw new Error('Property not found');
    }
    createResProp.guiElement = selectedProperty.guiEle;
    createResProp.subPropertyOf = [selectedProperty.subPropOf || ''];

    if ([Constants.HasLinkTo, Constants.IsPartOf].includes(selectedProperty.subPropOf || '')) {
      createResProp.objectType = guiAttr;
      createResProp.subjectType = this.data.resClass?.id || '';
    } else {
      createResProp.objectType = selectedProperty.objectType || '';
    }
    return createResProp;
  }

  private getGuiAttribute(guiAttr: string): string[] | undefined {
    switch (this.data.propertyInfo.propType.guiEle) {
      case Constants.GuiColorPicker:
        return [`ncolors=${guiAttr}`];
      case Constants.GuiList:
      case Constants.GuiPulldown:
      case Constants.GuiRadio:
        return [`hlist=<${guiAttr}>`];
      case Constants.GuiSimpleText:
        // --> TODO could have two guiAttr fields: size and maxlength
        // we suggest to use default value for size; we do not support this guiAttr in DSP-App
        return [`maxlength=${guiAttr}`];
      case Constants.GuiSpinbox:
        // --> TODO could have two guiAttr fields: min and max
        return [`min=${guiAttr}`, `max=${guiAttr}`];
      case Constants.GuiTextarea:
        // --> TODO could have four guiAttr fields: width, cols, rows, wrap
        // we suggest to use default values; we do not support this guiAttr in DSP-App
        return ['width=100%'];
    }

    return undefined;
  }
}
