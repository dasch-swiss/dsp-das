import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Constants, CreateResourceProperty, KnoraApiConnection, UpdateOntology } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { DefaultProperties, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { PropertyForm } from '@dsp-app/src/app/project/ontology/property-form/property-form-2.component';
import { finalize } from 'rxjs/operators';

export interface CreatePropertyFormDialogProps {
  ontologyId: string;
  lastModificationDate: string;
  propertyInfo: PropertyInfoObject;
  resClassIri?: string;
}

@Component({
  selector: 'app-create-property-form-dialog',
  template: ` <app-dialog-header
      title="Create a new property"
      [subtitle]="data.propertyInfo.propType.group + ': ' + data.propertyInfo.propType.label"></app-dialog-header>
    <app-property-form-2
      mat-dialog-content
      (formValueChange)="form = $event"
      [formData]="{ property: data.propertyInfo }"
      [creationMode]="true"></app-property-form-2>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Submit
      </button>
    </div>`,
})
export class CreatePropertyFormDialogComponent implements OnInit {
  loading = false;
  form: PropertyForm;

  get selectedProperty() {
    return DefaultProperties.data.flatMap(el => el.elements).find(e => e.guiEle === this.form.controls.propType.value);
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private dialogRef: MatDialogRef<CreatePropertyFormDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: CreatePropertyFormDialogProps
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onSubmit() {
    this.loading = true;
    const onto = this.getOntologyForNewProperty();

    this._dspApiConnection.v2.onto
      .createResourceProperty(onto)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  private getOntologyForNewProperty(): UpdateOntology<CreateResourceProperty> {
    const onto = new UpdateOntology<CreateResourceProperty>();

    onto.id = this.data.ontologyId;
    onto.lastModificationDate = this.data.lastModificationDate;

    // prepare payload for property
    const newResProp = new CreateResourceProperty();
    newResProp.name = this.form.controls.name.value;
    newResProp.label = this.form.getRawValue().labels;
    newResProp.comment = this.form.getRawValue().comments;

    /* TODO Julien removed
            const guiAttr = this.propertyForm.controls['guiAttr'].value;
            if (guiAttr) {
            newResProp.guiAttributes = this.setGuiAttribute(guiAttr);
            }
            */
    const selectedProperty = DefaultProperties.data
      .flatMap(el => el.elements)
      .find(e => e.guiEle === this.form.controls.propType.value);

    newResProp.guiElement = selectedProperty.guiEle;
    newResProp.subPropertyOf = [selectedProperty.subPropOf];

    if ([Constants.HasLinkTo, Constants.IsPartOf].includes(selectedProperty.subPropOf)) {
      // TODO Julien removed: newResProp.objectType = guiAttr;
      newResProp.subjectType = this.data.resClassIri;
    } else {
      newResProp.objectType = selectedProperty.objectType;
    }

    onto.entity = newResProp;
    return onto;
  }
}
