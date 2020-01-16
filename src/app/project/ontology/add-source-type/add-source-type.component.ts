import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Constants } from '@knora/api';
import { AutocompleteItem } from '@knora/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';

@Component({
    selector: 'app-add-source-type',
    templateUrl: './add-source-type.component.html',
    styleUrls: ['./add-source-type.component.scss']
})
export class AddSourceTypeComponent implements OnInit {

    /**
 * status for the progress indicator
 */
    loading: boolean = true;

    /**
     * project name to get existing ontologies
     * or to know where to add new ontologies and source types
     */
    @Input() projectcode: string;

    /**
     * event emitter, when the selected source types will be added to the ontology
     */
    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    /**
     * list of all source types
     * TODO: make it better; at the moment it's hardcoded. The IRIs are not correct. It should called "id"; Name is subClassOf
     */
    sourceTypes: AutocompleteItem[] = [
        {
            iri: Constants.StillImageFileValue,
            name: 'knora-api:StillImageRepresentation',
            label: 'Still Image'
        },
        {
            iri: Constants.MovingImageFileValue,
            name: 'knora-api:MovingImageRepresentation',
            label: 'Moving Image'
        },
        {
            iri: Constants.AudioFileValue,
            name: 'knora-api:AudioRepresentation',
            label: 'Audio'
        },
        {
            iri: Constants.DDDFileValue,
            name: 'knora-api:DDDRepresentation',
            label: 'RTI Image'
        },
        {
            iri: Constants.TextFileValue,
            name: 'knora-api:TextRepresentation',
            label: 'Text'
        },
        {
            iri: Constants.Resource,
            name: 'knora-api:Resource',
            label: 'Object without file representation (metadata only)'
        },
        {
            iri: Constants.DocumentFileValue,
            name: 'knora-api:DocumentRepresentation',
            label: 'Document (Word, PDF, etc.)'
        }
    ];

    constructor(
        private _dialog: MatDialog
    ) { }

    ngOnInit() {

    }

    openDialog(mode: string, type: AutocompleteItem): void {
        const dialogConfig: MatDialogConfig = {
            width: '720px',
            maxHeight: '90vh',
            position: {
                top: '112px'
            },
            data: { project: type.name, name: type.label, mode: mode }
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            // update the view
            this.refreshParent.emit();
        });
    }
}
