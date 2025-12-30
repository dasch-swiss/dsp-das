import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from './replace-file-dialog/replace-file-dialog.component';

@Component({
  selector: 'app-replace-file-menu-item',
  imports: [TranslatePipe, MatButton],
  template: `
    <button mat-flat-button (click)="openReplaceFileDialog()" data-cy="replace-file-button">
      {{ 'resourceEditor.representations.replaceFile' | translate }}
    </button>
  `,
})
export class ReplaceFileMenuItemComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
  @Input({ required: true }) parentResource!: ReadResource;
  @Input({ required: true }) viewContainerRef!: ViewContainerRef;
  @Input({ required: true }) representation!: string;

  constructor(private readonly _dialog: MatDialog) {}

  openReplaceFileDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      ...DspDialogConfig.mediumDialog({
        title: this.title,
        subtitle: this.subtitle,
        representation: this.representation,
        resource: this.parentResource,
      }),
      viewContainerRef: this.viewContainerRef,
    });
  }
}
