import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AutocompleteItem, KnoraConstants, ProjectsService } from '@knora/core';

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
     * form group
     */
    selectSourceTypeForm: FormGroup;

    /**
     * form errors; TODO: we don't need it!?
     */
    selectSourceTypeErrors = {
        'type': ''
    };

    /**
     * form error hints; TODO: we don't need it!?
     */
    validationMessages = {
        'type': {
            'existingName': 'This user is already a member of the project. You can\'t add him.'
        }
    };

    /**
     * message in case of an API error
     */
    errorMessage: any = undefined;

    /**
     * list of all source types
     */
    sourceTypes: AutocompleteItem[] = [];

    /**
     * filter source types while typing (autocomplete)
     */
    filteredSourceTypes: Observable<AutocompleteItem[]>;

    /**
     * selected source type object
     */
    selectedSourceType: AutocompleteItem;

    constructor (
        private _dialog: MatDialog,
        private _formBuilder: FormBuilder) { }

    ngOnInit() {

        this.buildForm();

        // just for developing / less clicks to see the source type form
        this.selectedSourceType = this.sourceTypes[0];
        // this.openDialog('addSourceType');
    }

    buildForm() {


        // TODO: make it better; at the moment it's hardcoded. And the IRIs are not correct. It should called/be "id"
        this.sourceTypes = [
            {
                iri: KnoraConstants.StillImageFileValue,
                name: 'StillImageRepresentation',
                label: 'Still Image'
            },
            {
                iri: KnoraConstants.MovingImageFileValue,
                name: 'MovingImageRepresentation',
                label: 'Moving Image'
            },
            {
                iri: KnoraConstants.AudioFileValue,
                name: 'AudioRepresentation',
                label: 'Audio'
            },
            {
                iri: KnoraConstants.DDDFileValue,
                name: 'DDDRepresentation',
                label: 'RTI Image'
            },
            {
                iri: KnoraConstants.TextFileValue,
                name: 'TextRepresentation',
                label: 'Text'
            },
            {
                iri: KnoraConstants.Resource,
                name: 'Resource',
                label: 'Object without file representation (metadata only)'
            },
            {
                iri: KnoraConstants.DocumentFileValue,
                name: 'DocumentRepresentation',
                label: 'Document (Word, PDF, etc.)'
            }
        ];

        this.loading = false;

        this.selectSourceTypeForm = this._formBuilder.group({
            'type': new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ])
        });

        this.filteredSourceTypes = this.selectSourceTypeForm.controls['type'].valueChanges
            .pipe(
                startWith(''),
                map(type => type.length >= 0 ? this.filter(this.sourceTypes, type) : [])
            );

        this.selectSourceTypeForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged(); // (re)set validation messages now
    }

    /**
     * filter a list while typing in auto complete input field
     * @param list List of options
     * @param name Value to filter by
     * @returns Filtered list of options
     */
    filter(list: AutocompleteItem[], name: string) {
        return list.filter(type =>
            type.label.toLowerCase().includes(name.toLowerCase())
        );
    }

    /**
     * set the error messages on value changed
     *
     * @param (data)
     */
    onValueChanged(data?: any) {

        if (!this.selectSourceTypeForm) {
            return;
        }

        // reset selected source types
        this.selectedSourceType = undefined;

        // check if the form is valid

        Object.keys(this.selectSourceTypeErrors).map(field => {

            this.selectSourceTypeErrors[field] = '';
            const control = this.selectSourceTypeForm.get(field);
            if (control.value.length >= 2) {
                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    Object.keys(control.errors).map(key => {
                        this.selectSourceTypeErrors[field] += messages[key] + ' ';
                    });
                }
            }

        });

    }

    // TODO: onValueChanged

    addSourceType(val: string) {
        // add to ontology
        console.log(val);
        this.selectedSourceType = this.sourceTypes.find(st => {
            return st.iri === val;
        });
        console.log(this.selectedSourceType);
        this.openDialog('addSourceType');
    }


    openDialog(mode: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '720px',
            maxHeight: '90vh',
            position: {
                top: '112px'
            },
            data: { project: this.selectedSourceType.iri, name: this.selectedSourceType.label, mode: mode }
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            // update the view
            this.refreshParent.emit();
        });
    }

    resetInput(ev: Event) {
        ev.preventDefault();
        this.selectSourceTypeForm.controls['type'].reset('');
    }
}
