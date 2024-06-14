import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogProps,
} from '@dsp-app/src/app/main/action/confirm-dialog/confirm-dialog.component';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private _dialog: MatDialog) {}

  afterConfirmation(message: string, title: string | null = null, subtitle: string | null = null) {
    return this._dialog
      .open<ConfirmDialogComponent, ConfirmDialogProps, boolean>(ConfirmDialogComponent, {
        data: {
          message,
          title,
          subtitle,
        },
      })
      .afterClosed()
      .pipe(filter(response => response === true));
  }
}
