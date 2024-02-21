import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Constants, CreateResourceProperty, KnoraApiConnection, UpdateOntology } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { PropertyForm } from '@dsp-app/src/app/project/ontology/property-form/property-form-2.component';

export interface CreatePropertyFormDialogProps {
  ontologyId: string;
  lastModificationDate: string;
  propertyInfo: PropertyInfoObject;
  resClassIri?: string;
}

@Component({
  selector: 'app-create-property-form-dialog',
  template: ` <app-dialog-header title="Create a new property"></app-dialog-header>
    <mat-dialog-content>
      <app-property-form-2 (formValueChange)="form = $event"></app-property-form-2>
    </mat-dialog-content>
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

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private dialogRef: MatDialogRef<CreatePropertyFormDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) private data: CreatePropertyFormDialogProps
  ) {}

  onSubmit() {
    const onto = this.getOntologyForNewProperty();

    this._dspApiConnection.v2.onto.createResourceProperty(onto).subscribe(() => {
      this.loading = false;
      this.dialogRef.close();
    });
  }

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
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
    newResProp.guiElement = this.data.propertyInfo.propType.guiEle;
    newResProp.subPropertyOf = [this.data.propertyInfo.propType.subPropOf];

    if (
      this.data.propertyInfo.propType.subPropOf === Constants.HasLinkTo ||
      this.data.propertyInfo.propType.subPropOf === Constants.IsPartOf
    ) {
      // TODO Julien removed: newResProp.objectType = guiAttr;
      newResProp.subjectType = this.data.resClassIri;
    } else {
      newResProp.objectType = this.data.propertyInfo.propType.objectType;
    }

    onto.entity = newResProp;
    return onto;
  }
}