import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { TranslateModule } from '@ngx-translate/core';
import { MembershipComponent } from '../membership/membership.component';

export interface ManageProjectMembershipDialogProps {
  user: ReadUser;
}

@Component({
  selector: 'app-manage-project-membership-dialog',
  template: ` <app-dialog-header [title]="data.user.username" [subtitle]="'Manage project membership'" />
    <app-membership [userId]="data.user.id" (closeDialog)="dialogRef.close()" />
    <mat-dialog-actions>
      <button mat-button color="primary" matDialogClose>{{ 'ui.form.action.close' | translate }}</button>
    </mat-dialog-actions>`,
  standalone: true,
  imports: [DialogHeaderComponent, MembershipComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule],
})
export class ManageProjectMembershipDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ManageProjectMembershipDialogProps,
    public dialogRef: MatDialogRef<ManageProjectMembershipDialogComponent, boolean>
  ) {}
}
