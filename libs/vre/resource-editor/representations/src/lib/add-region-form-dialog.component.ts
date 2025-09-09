import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { CommonInputComponent, CkEditorControlComponent, ColorPickerComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslateModule } from '@ngx-translate/core';

export interface AddRegionFormDialogProps {
  resourceIri: string;
}

@Component({
  selector: 'app-add-region-form',
  template: `
    <app-dialog-header
      [title]="'resourceEditor.representations.addRegionFormDialog.createAnnotation' | translate"
      [subtitle]="'Add further properties'" />
    <mat-dialog-content>
      <form [formGroup]="regionForm" class="form-content">
        <app-common-input [label]="'Label'" [control]="regionForm.controls.label" />

        <app-ck-editor-control [control]="regionForm.controls.comment" [label]="'Comment'" />

        <mat-form-field class="large-field without-border color-field">
          <mat-label class="color-label">Color *</mat-label>
          <app-color-picker #colorInput [formControl]="regionForm.controls.color" class="value" />
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>{{ 'ui.form.action.cancel' | translate }}</button>
      <button
        mat-raised-button
        [mat-dialog-close]="regionForm.value"
        type="button"
        color="primary"
        [disabled]="regionForm.invalid">
        Submit
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-content {
        margin: 0;

        .form-panel {
          margin-top: 16px;
        }
      }

      ::ng-deep .color-field > .mat-mdc-text-field-wrapper {
        padding-top: 22px;
      }

      .color-field {
        ::ng-deep .mat-mdc-text-field-wrapper {
          overflow: visible;
          z-index: 999;

          .color-label {
            line-height: 48px;
          }

          .mat-mdc-form-field-infix {
            padding-top: 13px;
            min-height: 50px;
          }

          color-picker .open {
            top: -240px !important;
            left: 240px !important;
            position: absolute !important;
          }
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    DialogHeaderComponent,
    CdkScrollable,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    CommonInputComponent,
    CkEditorControlComponent,
    MatFormField,
    MatLabel,
    ColorPickerComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslateModule,
  ],
})
export class AddRegionFormDialogComponent {
  readonly regionForm = this._fb.group({
    color: ['#ff3333', [Validators.required, Validators.pattern('^#[a-f0-9]{6}$')]],
    comment: [null],
    label: [null, Validators.required],
  });

  constructor(
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: AddRegionFormDialogProps
  ) {}
}
