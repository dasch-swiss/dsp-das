import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// TODO: refactor this ugly interface ... name = main iri?! makes no sense
export interface DialogData {
    mode: string;
    name?: string;      // main iri
    project?: string;   // second iri or connected iri
    confirm?: boolean;
}

@Component({
    selector: 'app-material-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {


    constructor (
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) { }

    ngOnInit() { }

    closeDialog(): void {
        // close dialog withou sending data to parent
        this.dialogRef.close();
    }
}
