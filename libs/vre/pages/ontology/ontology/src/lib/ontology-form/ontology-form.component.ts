import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OntologyMetadata } from '@dasch-swiss/dsp-js';
import { OntologiesSelectors } from '@dasch-swiss/vre/core/state';
import { existingNamesValidator } from '@dasch-swiss/vre/pages/user-settings/user';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { OntologyEditService } from '../services/ontology-edit.service';
import { OntologyForm, OntologyData } from './ontology-form.type';

@Component({
  selector: 'app-ontology-form',
  templateUrl: './ontology-form.component.html',
})
export class OntologyFormComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<void> = new Subject<void>();

  ontologyForm!: OntologyForm;

  readonly forbiddenNames = ['knora', 'salsah', 'standoff', 'ontology', 'simple', 'shared'] as const;

  readonly ontoNamePatternErrorMsg = {
    errorKey: 'pattern',
    message:
      "Name shouldn't start with a number or v + number and spaces or special characters (except dash, dot and underscore) are not allowed.",
  };

  readonly ontoNameExistsErrorMsg = {
    errorKey: 'pattern',
    message: 'This name is not allowed or exists already.',
  };

  get ontologyName(): string {
    return this.data?.id ? OntologyService.getOntologyName(this.data.id) : '';
  }

  get existingOntologyNames(): string[] {
    return this._store
      .selectSnapshot(OntologiesSelectors.currentProjectOntologies)
      .map(onto => OntologyService.getOntologyName(onto.id));
  }

  get blackListedNames(): RegExp[] {
    const forbiddenRegex = this.forbiddenNames.map(name => new RegExp(name));
    const existingOntologyRegex = this.existingOntologyNames.map(name => new RegExp(`(?:^|\\W)${name}(?:$|\\W)`));
    return [...forbiddenRegex, ...existingOntologyRegex];
  }

  constructor(
    private _fb: FormBuilder,
    private _oes: OntologyEditService,
    private _store: Store,
    @Inject(MAT_DIALOG_DATA) public data: OntologyData,
    public dialogRef: MatDialogRef<OntologyFormComponent, OntologyMetadata>
  ) {}

  ngOnInit() {
    this._buildForm(this.data);

    this.ontologyForm.controls.name.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
      if (this.ontologyForm.controls.label.pristine) {
        this.ontologyForm.controls.label.patchValue(this._proposeLabel(this.ontologyForm.controls.name.value));
      }
    });
  }

  private _proposeLabel(ontoName = '') {
    return ontoName ? `${ontoName.charAt(0).toUpperCase()}${ontoName.slice(1)}` : '';
  }

  private _buildForm(ontology?: OntologyData): void {
    this.ontologyForm = this._fb.group({
      name: [
        { value: this.ontologyName, disabled: !!ontology },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(16),
          Validators.pattern(CustomRegex.ID_NAME_REGEX),
          existingNamesValidator(this.blackListedNames),
        ],
      ],
      label: [
        ontology?.label?.includes(':') ? ontology.label.split(':')[1] : ontology?.label || '',
        [Validators.required, Validators.minLength(3)],
      ],
      comment: [ontology ? ontology.comment : '', Validators.required],
    });
  }

  submitData() {
    const ontologyData: OntologyData = {
      name: this.ontologyForm.controls.name.value,
      label: this.ontologyForm.controls.label.value,
      comment: this.ontologyForm.controls.comment.value,
      id: this.data?.id,
    };
    const transaction$ = this.data?.id
      ? this._oes.updateOntology(ontologyData)
      : this._oes.createOntology(ontologyData);
    transaction$.pipe(take(1)).subscribe(o => {
      this.dialogRef.close(o);
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
