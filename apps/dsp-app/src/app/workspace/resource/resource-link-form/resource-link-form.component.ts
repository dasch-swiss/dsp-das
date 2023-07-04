import {
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
    ApiResponseError,
    Constants,
    CreateLinkValue,
    CreateResource,
    CreateUnformattedTextValue,
    KnoraApiConnection,
    ReadResource,
    StoredProject,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ErrorHandlerService } from '@dsp-app/src/app/main/services/error-handler.service';
import { FilteredResources } from '../../results/list-view/list-view.component';
import { ProjectService } from '../services/project.service';
import { ResourceService } from '../services/resource.service';

@Component({
    selector: 'app-resource-link-form',
    templateUrl: './resource-link-form.component.html',
    styleUrls: ['./resource-link-form.component.scss'],
})
export class ResourceLinkFormComponent implements OnInit {
    @Input() resources: FilteredResources;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    /**
     * form group, errors and validation messages
     */
    form: UntypedFormGroup;

    formErrors = {
        label: '',
    };

    validationMessages = {
        label: {
            required: 'A label is required.',
        },
    };

    usersProjects: StoredProject[];

    selectedProject: string;

    error = false;
    loading = false;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _fb: UntypedFormBuilder,
        private _project: ProjectService,
        private _resourceService: ResourceService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // initialize projects to be used for the project selection in the creation form
        this._project
            .initializeProjects()
            .subscribe((proj: StoredProject[]) => {
                this.usersProjects = proj;
            });

        this.form = this._fb.group({
            label: new UntypedFormControl(
                {
                    value: '',
                    disabled: false,
                },
                [Validators.required]
            ),
            comment: new UntypedFormControl(),
            project: new UntypedFormControl(),
        });

        this.form.valueChanges.subscribe(() => this.onValueChanged());
    }

    /**
     * this method is for the form error handling
     */
    onValueChanged() {
        if (!this.form) {
            return;
        }

        const form = this.form;

        Object.keys(this.formErrors).map((field) => {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map((key) => {
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

        linkObj.type = Constants.LinkObj;

        linkObj.attachedToProject = this.selectedProject;

        const hasLinkToValue = [];

        this.resources.resInfo.forEach((res) => {
            const linkVal = new CreateLinkValue();
            linkVal.type = Constants.LinkValue;
            linkVal.linkedResourceIri = res.id;
            hasLinkToValue.push(linkVal);
        });

        const comment = this.form.controls['comment'].value;
        if (comment) {
            const commentVal = new CreateUnformattedTextValue();
            commentVal.type = Constants.UnformattedTextValue;
            commentVal.text = comment;
            linkObj.properties = {
                [Constants.HasLinkToValue]: hasLinkToValue,
                [Constants.HasComment]: [commentVal],
            };
        } else {
            linkObj.properties = {
                [Constants.HasLinkToValue]: hasLinkToValue,
            };
        }

        this._dspApiConnection.v2.res.createResource(linkObj).subscribe(
            (res: ReadResource) => {
                const path = this._resourceService.getResourcePath(res.id);
                const goto = '/resource' + path;
                this._router
                    .navigate([])
                    .then(() => window.open(goto, '_blank'));
                this.closeDialog.emit();
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
