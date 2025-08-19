import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OntologyMetadata } from '@dasch-swiss/dsp-js';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { existingNamesAsyncValidator, existingNamesValidator } from '@dasch-swiss/vre/pages/user-settings/user';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { map, Subject, take, takeUntil } from 'rxjs';
import { OntologyEditService } from '../../services/ontology-edit.service';
import { OntologyForm, UpdateOntologyData } from './ontology-form.type';

@Component({
  selector: 'app-ontology-form',
  templateUrl: './ontology-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyFormComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<void> = new Subject<void>();

  ontologyForm!: OntologyForm;
  loading = false;

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
    return this.data?.id ? OntologyService.getOntologyNameFromIri(this.data.id) : '';
  }

  get blackListedNames() {
    return this._projectPageService.detailedOntologies$.pipe(
      map(ontos => {
        const existingOntologyNames = ontos.map(onto => OntologyService.getOntologyNameFromIri(onto.id));
        return [...this.forbiddenNames, ...existingOntologyNames];
      })
    );
  }

  constructor(
    private _fb: FormBuilder,
    private _oes: OntologyEditService,
    private _projectPageService: ProjectPageService,
    private _store: Store,
    @Inject(MAT_DIALOG_DATA) public data: UpdateOntologyData | undefined,
    public dialogRef: MatDialogRef<OntologyFormComponent, OntologyMetadata>
  ) {}

  ngOnInit() {
    this._buildForm();

    if (!this.data) {
      this.ontologyForm.controls.name.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
        if (this.ontologyForm.controls.label.pristine) {
          this.ontologyForm.controls.label.patchValue(this._proposeLabel(this.ontologyForm.controls.name.value));
        }
      });
    }
  }

  private _proposeLabel(ontoName = '') {
    return ontoName ? `${ontoName.charAt(0).toUpperCase()}${ontoName.slice(1)}` : '';
  }

  private _buildForm(): void {
    this.ontologyForm = this._fb.group({
      name: this._fb.control(
        { value: this.ontologyName, disabled: !!this.data?.id },
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(16),
            Validators.pattern(CustomRegex.ID_NAME_REGEX),
            existingNamesAsyncValidator(this.blackListedNames),
          ],
        }
      ),
      label: this._fb.control(this.data?.label || '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      comment: this._fb.control(this.data?.comment || '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  submitData() {
    this.loading = true;

    const transaction$ = this.data?.id
      ? this._oes.updateOntology$({
          id: this.data.id,
          label: this.ontologyForm.controls.label.value,
          comment: this.ontologyForm.controls.comment.value,
        })
      : this._oes.createOntology$({
          name: this.ontologyForm.controls.name.value,
          label: this.ontologyForm.controls.label.value,
          comment: this.ontologyForm.controls.comment.value,
        });

    transaction$.pipe(take(1)).subscribe(o => {
      this.dialogRef.close(o);
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
