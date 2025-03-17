import { Component } from '@angular/core';

@Component({
  selector: 'app-create-authorship-dialog',
  template: ` <app-dialog-header title="Add an authorship" />

    <app-common-input label="Authorship" [control]="form.controls.copyrightHolder" />
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Save
      </button>
    </div>
    \`,`,
})
export class CreateAuthorshipDialogComponent {}
