import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponseError, Constants, CreateLinkValue, CreateResource, CreateTextValueAsString, KnoraApiConnection, ReadResource, StoredProject } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, FilteredResouces } from '@dasch-swiss/dsp-ui';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { ProjectService } from '../project.service';

@Component({
    selector: 'app-resource-link-form',
    templateUrl: './resource-link-form.component.html',
    styleUrls: ['./resource-link-form.component.scss']
})
export class ResourceLinkFormComponent implements OnInit {

    @Input() resources: FilteredResouces;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    /**
     * form group, errors and validation messages
     */
    form: FormGroup;

    formErrors = {
        'label': ''
    };

    validationMessages = {
        'label': {
            'required': 'A label is required.'
        }
    };

    usersProjects: StoredProject[];

    selectedProject: string;

    error = false;
    loading = false;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _fb: FormBuilder,
        private _project: ProjectService
    ) { }

    ngOnInit(): void {

        // initialize projects to be used for the project selection in the creation form
        this._project.initializeProjects().subscribe(
            (proj: StoredProject[]) => {
                this.usersProjects = proj;
            }
        );

        this.form = this._fb.group({
            'label': new FormControl({
                value: '', disabled: false
            }, [
                Validators.required
            ]),
            'comment': new FormControl(),
            'project': new FormControl()
        });

        this.form.valueChanges
            .subscribe(data => this.onValueChanged(data));
    }

    /**
     * this method is for the form error handling
     *
     * @param data Data which changed.
     */
    onValueChanged(data?: any) {

        if (!this.form) {
            return;
        }

        const form = this.form;

        Object.keys(this.formErrors).map(field => {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.formErrors[field] += messages[key] + ' ';
                });

            }
        });
    }

    /**
     * submits the data
     */
    submitData() {

        this.loading = true;

        // build link resource as type CreateResource
        const linkObj = new CreateResource();

        linkObj.label = this.form.controls['label'].value;

        linkObj.type = Constants.KnoraApiV2 + Constants.HashDelimiter + 'LinkObj';

        linkObj.attachedToProject = this.selectedProject;

        // hasComment[Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasComment'] = [];
        const hasLinkToValue = [];
        // hasLinkToValue[Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasLinkToValue'] = [];
        this.resources.resIds.forEach(id => {
            const linkVal = new CreateLinkValue();
            linkVal.type = Constants.LinkValue;
            linkVal.linkedResourceIri = id;
            // the value could have a comment
            // linkVal.valueHasComment = 'comment from link res form?';

            hasLinkToValue.push(linkVal);
        });


        const comment = this.form.controls['comment'].value;
        if (comment) {
            const commentVal = new CreateTextValueAsString();
            commentVal.type = Constants.TextValue;
            commentVal.text = comment;
            linkObj.properties = {
                [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasLinkToValue']: hasLinkToValue,
                [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasComment']: [commentVal],
            };
        } else {
            linkObj.properties = {
                [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasLinkToValue']: hasLinkToValue,
            };
        }

        this._dspApiConnection.v2.res.createResource(linkObj).subscribe(
            (response: ReadResource) => {
                // --> TODO: do something with the successful response
                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
                this.error = true;
                this.loading = false;
            }
        );

    }
}
