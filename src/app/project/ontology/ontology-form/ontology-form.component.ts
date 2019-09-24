import { CacheService } from 'src/app/main/cache/cache.service';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiServiceError, OntologyService, Project, ProjectsService } from '@knora/core';

export interface NewOntology {
    projectIri: string;
    name: string;
    label: string;
}


@Component({
    selector: 'app-ontology-form',
    templateUrl: './ontology-form.component.html',
    styleUrls: ['./ontology-form.component.scss']
})
export class OntologyFormComponent implements OnInit {

    loading: boolean;

    // project short code
    @Input() projectcode: string;

    @Output() closeDialog: EventEmitter<string> = new EventEmitter<string>();

    project: Project;

    ontologyForm: FormGroup;

    ontologyLabel: string = '';

    nameRegex = /^[a-zA-Z]+\S*$/;

    nameMinLength = 3;
    nameMaxLength = 16;

    formErrors = {
        'name': ''
    };

    validationMessages = {
        'name': {
            'required': 'Name is required.',
            'minlength': 'Name must be at least ' + this.nameMinLength + ' characters long.',
            'maxlength': 'Name cannot be more than ' + this.nameMaxLength + ' characters long.',
            'pattern': 'Name shouldn\'t start with a number; Spaces or special characters are not allowed.',
            'existingName': 'This name is already taken.'
        }
    };

    constructor (private _fb: FormBuilder,
        private _router: Router,
        private _cache: CacheService,
        private _projectsService: ProjectsService,
        private _ontologyService: OntologyService) { }

    ngOnInit() {

        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
            (result: Project) => {
                this.project = result;

                this.buildForm();
            },
            (error: ApiServiceError) => {
                console.error(error);
                this.loading = false;
            }
        );

        this.loading = false;

    }

    buildForm() {

        this.ontologyLabel = this.project.shortname + ' ontology (data model): ';

        this.ontologyForm = this._fb.group({
            name: new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required,
                    Validators.minLength(this.nameMinLength),
                    Validators.maxLength(this.nameMaxLength),
                    // existingNamesValidator(this.existingShortNames),
                    Validators.pattern(this.nameRegex)
                ]),
            label: new FormControl({
                value: this.ontologyLabel, disabled: true
            })
        });

        this.ontologyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
    }

    onValueChanged(data?: any) {

        if (!this.ontologyForm) {
            return;
        }

        this.ontologyLabel = this.project.shortname + ' ontology (data model): ' + data.name;

        Object.keys(this.formErrors).map(field => {
            this.formErrors[field] = '';
            const control = this.ontologyForm.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.formErrors[field] += messages[key] + ' ';
                });

            }
        });
        // reset selected source types
        // this.selectedSourceType = undefined;

        // check if the form is valid

        /* Object.keys(this.selectSourceTypeErrors).map(field => {

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

        }); */

    }

    createOntology() {
        this.loading = true;

        // const something: number = Math.floor(Math.random() * Math.floor(9999));

        const ontologyData: NewOntology = {
            projectIri: this.project.id,
            name: this.ontologyForm.controls['name'].value,
            label: this.ontologyLabel
        };
        this._ontologyService.createOntology(ontologyData).subscribe(
            (ontology: any) => {

                // set cache for the new ontology
                this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(ontology['@id']));

                this.closeDialog.emit(ontology['@id']);

                // go to correct route
                const goto = 'project/' + this.projectcode + '/ontologies/' + encodeURIComponent(ontology['@id']);
                this._router.navigate([goto]);

            },
            (error: any) => {
                // in case of an error... e.g. because the ontolog iri is not unique, rebuild the form including the error message

                this.formErrors['name'] += this.validationMessages['name']['existingName'] + ' ';
                this.loading = false;

                console.error(error);
            }
        );
    }

    /**
     * Reset the form
     */
    resetForm(ev: Event, sourceType?: any) {

        this.ontologyLabel = this.project.shortname + ' ontology (data model): ';

        this.buildForm();

    }

    closeMessage(id: string) {
        this.closeDialog.emit(id);
    }

}
