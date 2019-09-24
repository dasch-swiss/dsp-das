import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';

import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { OntologyService } from '@knora/core';

import { OntologyInfo } from '../ontology.component';

@Component({
    selector: 'app-ontology-list',
    templateUrl: './ontology-list.component.html',
    styleUrls: ['./ontology-list.component.scss']
})
export class OntologyListComponent implements OnInit {

    loading: boolean;

    @Input() ontologies: OntologyInfo[];

    @Input() selected?: string;

    @Input() projectcode: string;

    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    ontologyForm: FormGroup;

    newOntologyId: string;

    // i18n setup
    itemPluralMapping = {
        ontology: {
            // '=0': '0 Ontologies',
            '=1': '1 data model',
            other: '# data models'
        }
    };

    constructor (
        private _cache: CacheService,
        private _ontologyService: OntologyService,
        private _dialog: MatDialog,
        private _router: Router,
        private _fb: FormBuilder) {
    }

    ngOnInit() {

        this.loading = true;

        console.log(this.selected);

        if (this.selected) {
            this.openOntology(this.selected);
        }

        this.ontologyForm = this._fb.group({
            ontology: new FormControl({
                value: this.selected, disabled: false
            }, [
                    Validators.required
                ])
        });

        this.loading = false;

        this.ontologyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
    }

    onValueChanged(data?: any) {

        if (!this.ontologyForm) {
            return;
        }

        // go to page with this id
        // this._router.navigateByUrl(this._router.url.replace(id, data.ontology));

        if (data.ontology !== 'createOntology') {
            this.refreshParent.emit(data.ontology);
            this.openOntology(data.ontology);
        }

    }

    openOntology(id: string) {
        const goto = 'project/' + this.projectcode + '/ontologies/' + encodeURIComponent(id);
        this._router.navigate([goto]);
    }

    // when select "create new ontology", it opens ontology form in dialog box
    openDialog(mode: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            position: {
                top: '112px'
            },
            data: { project: this.projectcode, mode: mode }
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            // update the list of ontologies
            this.refreshParent.emit();
        });
    }

}
