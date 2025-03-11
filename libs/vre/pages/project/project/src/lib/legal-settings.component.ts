import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    AddCopyrightHolderDialogComponent,
    AddCopyrightHolderDialogProps,
} from './add-copyright-holder-dialog.component';

@Component({
    selector: 'app-legal-settings',
    template: `
        <button color="primary" mat-button type="reset" (click)="addCopyrightHolder()">Add (copyright holder)</button>`,
})
export class LegalSettingsComponent {

    constructor(private _dialog: MatDialog)

    addCopyrightHolder() {
        this._dialog.open<AddCopyrightHolderDialogComponent, AddCopyrightHolderDialogProps>(AddCopyrightHolderDialogComponent);
    }
}
