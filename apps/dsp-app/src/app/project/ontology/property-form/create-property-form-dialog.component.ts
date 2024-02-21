import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  Constants,
  CreateResourceProperty,
  KnoraApiConnection,
  ResourcePropertyDefinitionWithAllLanguages,
  UpdateOntology,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

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
  form: FormGroup;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private dialogRef: MatDialogRef<CreatePropertyFormDialogComponent, boolean>
  ) {}

  onSubmit() {
    const onto = this.getOntologyForNewProperty();

    this._dspApiConnection.v2.onto
      .createResourceProperty(onto)
      .subscribe((response: ResourcePropertyDefinitionWithAllLanguages) => {
        this.lastModificationDate = response.lastModificationDate;
        this.loading = false;
        this.closeDialog.emit();
      });
  }

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  private getOntologyForNewProperty(): UpdateOntology<CreateResourceProperty> {
    const onto = new UpdateOntology<CreateResourceProperty>();

    onto.id = this.ontology.id;
    onto.lastModificationDate = this.lastModificationDate;

    // prepare payload for property
    const newResProp = new CreateResourceProperty();
    newResProp.name = this.propertyForm.controls['name'].value;
    newResProp.label = this.labels;
    newResProp.comment = this.comments;

    const guiAttr = this.propertyForm.controls['guiAttr'].value;
    if (guiAttr) {
      newResProp.guiAttributes = this.setGuiAttribute(guiAttr);
    }
    newResProp.guiElement = this.propertyInfo.propType.guiEle;
    newResProp.subPropertyOf = [this.propertyInfo.propType.subPropOf];

    if (
      this.propertyInfo.propType.subPropOf === Constants.HasLinkTo ||
      this.propertyInfo.propType.subPropOf === Constants.IsPartOf
    ) {
      newResProp.objectType = guiAttr;
      newResProp.subjectType = this.resClassIri;
    } else {
      newResProp.objectType = this.propertyInfo.propType.objectType;
    }

    onto.entity = newResProp;
    return onto;
  }
}
