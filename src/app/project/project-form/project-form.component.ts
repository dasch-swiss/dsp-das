import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    Project,
    ProjectResponse,
    ProjectsResponse,
    ReadProject,
    StringLiteral,
    UpdateProjectRequest,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { existingNamesValidator } from 'src/app/main/directive/existing-name/existing-name.directive';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { SessionService } from 'src/app/main/services/session.service';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-project-form',
    templateUrl: './project-form.component.html',
    styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {

    /**
     * param of project form component:
     * Optional projectCode; if exists we are in edit mode
     * otherwise we build empty form to create new project
     */
    @Input() projectCode?: string;

    /**
     * output of project form component:
     * emits info to parent that dialog box was closed
     */
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    project: ReadProject;
    description: StringLiteral[];

    loading = true;

    // is the logged-in user system admin?
    sysAdmin = false;

    /**
     * shortcode and shortname must be unique
     */
    existingShortNames: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];
    shortnameRegex = /^[a-zA-Z]+\S*$/;

    existingShortcodes: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];
    shortcodeRegex = /^[0-9A-Fa-f]+$/;

    /**
     * some restrictions and rules for
     * description, shortcode, shortname and keywords
     */
    descriptionMaxLength = 2000;
    shortcodeMinLength = 4;
    shortcodeMaxLength: number = this.shortcodeMinLength;

    shortnameMinLength = 3;
    shortnameMaxLength = 16;

    // keywords is an array of objects of {name: 'string'}
    keywords: string[] = [];
    // separator: Enter, comma
    separatorKeyCodes = [ENTER, COMMA];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

    /**
     * success of sending data
     */
    success = false;

    /**
     * message after successful post
     */
    successMessage: any = {
        status: 200,
        statusText: 'You have successfully updated the project data.'
    };

    /**
     * form group, errors and validation messages
     */
    form: FormGroup;

    formErrors = {
        'shortname': '',
        'longname': '',
        'shortcode': '',
        'description': '',
        'keywords': ''
        // 'institution': ''
    };

    validationMessages = {
        'shortname': {
            'required': 'Short name is required.',
            'minlength': 'Short name must be at least ' + this.shortnameMinLength + ' characters long.',
            'maxlength': 'Short name cannot be more than ' + this.shortnameMaxLength + ' characters long.',
            'pattern': 'Short name shouldn\'t start with a number; Spaces are not allowed.',
            'existingName': 'This short name is already taken.'
        },
        'longname': {
            'required': 'Project (long) name is required.'
        },
        'shortcode': {
            'required': 'Shortcode is required',
            'maxlength': 'Shortcode cannot be more than ' + this.shortcodeMaxLength + ' characters long.',
            'minlength': 'Shortcode cannot be less than ' + this.shortcodeMinLength + ' characters long.',
            'pattern': 'This is not a hexadecimal value!',
            'existingName': 'This shortcode is already taken.'
        },
        'description': {
            'required': 'A description is required.',
            'maxlength': 'Description cannot be more than ' + this.descriptionMaxLength + ' characters long.'
        },
        'keywords': {
            'required': 'At least one keyword is required.'
        }
        // 'institution': {}
    };

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _errorHandler: ErrorHandlerService,
        private _fb: FormBuilder,
        private _router: Router,
        private _session: SessionService
    ) {
    }

    ngOnInit() {

        // if projectCode exists, we are in edit mode
        // otherwise create new project
        if (this.projectCode) {
            // edit existing project
            // get origin project data first
            this._dspApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectCode).subscribe(
                (response: ApiResponseData<ProjectResponse>) => {
                    // save the origin project data in case of reset
                    this.project = response.body.project;

                    this.buildForm(this.project);

                    this.loading = false;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );

        } else {
            // create new project

            // to avoid dublicate shortcodes or shortnames
            // we have to create a list of already exisiting short codes and names
            this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
                (response: ApiResponseData<ProjectsResponse>) => {

                    for (const project of response.body.projects) {

                        this.existingShortNames.push(new RegExp('(?:^|W)' + project.shortname.toLowerCase() + '(?:$|W)'));

                        if (project.shortcode !== null) {
                            this.existingShortcodes.push(new RegExp('(?:^|W)' + project.shortcode.toLowerCase() + '(?:$|W)'));
                        }
                    }
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );

            this.project = new ReadProject();
            this.project.status = true;

            this.buildForm(this.project);

            this.loading = false;

        }
    }

    /**
     * build form with project data
     * Project data contains exising data (edit mode)
     * or no data (create mode) => new ReadProject()
     *
     * @param project
     */
    buildForm(project: ReadProject): void {
        // if project is defined, we're in the edit mode
        // otherwise "create new project" mode is active
        // edit mode is true, when a projectCode exists

        // disabled is true, if project status is false (= archived);
        const disabled = (!project.status);

        // separate description
        if (!this.projectCode) {
            this.description = [new StringLiteral()];
            this.formErrors['description'] = '';
        }

        // separate list of keywords
        this.keywords = project.keywords;

        this.form = this._fb.group({
            'shortname': new FormControl({
                value: project.shortname, disabled: (this.projectCode)
            }, [
                Validators.required,
                Validators.minLength(this.shortnameMinLength),
                Validators.maxLength(this.shortnameMaxLength),
                existingNamesValidator(this.existingShortNames),
                Validators.pattern(this.shortnameRegex)
            ]),
            'longname': new FormControl({
                value: project.longname, disabled: disabled
            }, [
                Validators.required
            ]),
            'shortcode': new FormControl({
                value: project.shortcode, disabled: ((this.projectCode) && project.shortcode !== null)
            }, [
                Validators.required,
                Validators.minLength(this.shortcodeMinLength),
                Validators.maxLength(this.shortcodeMaxLength),
                existingNamesValidator(this.existingShortcodes),
                Validators.pattern(this.shortcodeRegex)
            ]),
            'logo': new FormControl({
                value: project.logo, disabled: disabled
            }),
            'status': [true],
            'selfjoin': [false],
            'keywords': new FormControl({
                // must be empty (even in edit mode), because of the mat-chip-list
                value: [], disabled: disabled
            }, [
                Validators.required
            ])
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
     * gets string literal
     * @param data
     */
    getStringLiteral(data: StringLiteral[]) {
        this.description = data;
        if (!this.description.length) {
            this.formErrors['description'] = this.validationMessages['description'].required;
        } else {
            this.formErrors['description'] = '';
        }
    }

    addKeyword(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (!this.keywords) {
            this.keywords = [];
        }

        // add keyword
        if ((value || '').trim()) {
            this.keywords.push(value.trim());
        }

        // reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeKeyword(keyword: any): void {
        const index = this.keywords.indexOf(keyword);

        if (index >= 0) {
            this.keywords.splice(index, 1);
        }
    }

    submitData() {
        this.loading = true;

        // a) update keywords from mat-chip-list
        if (!this.keywords) {
            this.keywords = [];
        }
        this.form.controls['keywords'].setValue(this.keywords);
        // this.form.controls['keywords'].disabled = !this.project.status;

        // b) update description field / multi language preparation
        // fIXME: this is a quick (hardcoded) hack:
        // --> TODO create multi language input fields
        // this.form.controls['description'].setValue([{
        //     'language': 'en',
        //     'value': this.form.controls['description'].value
        // }]);


        if (this.projectCode) {
            const projectData: UpdateProjectRequest = new UpdateProjectRequest();
            projectData.description = [new StringLiteral()];
            // projectData.description = this.description;
            projectData.keywords = this.form.value.keywords;
            projectData.longname = this.form.value.longname;
            projectData.status = true;

            let i = 0;
            for (const d of this.description) {
                projectData.description[i] = new StringLiteral();
                projectData.description[i].language = d.language;
                projectData.description[i].value = d.value;
                i++;
            }

            // edit / update project data
            this._dspApiConnection.admin.projectsEndpoint.updateProject(this.project.id, projectData).subscribe(
                (response: ApiResponseData<ProjectResponse>) => {

                    // this.originProject = response.body.project;
                    this.project = response.body.project;
                    this.buildForm(this.project);

                    // update cache
                    this._cache.set(this.projectCode, response);

                    this.success = true;

                    this.loading = false;

                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                    this.loading = false;
                }
            );
        } else {
            // create new project
            const projectData: Project = new Project();

            projectData.shortcode = this.form.value.shortcode;
            projectData.shortname = this.form.value.shortname;
            projectData.longname = this.form.value.longname;
            projectData.keywords = this.form.value.keywords;
            projectData.description = [new StringLiteral()];
            // projectData.description = this.description;
            projectData.status = true;
            projectData.selfjoin = false;

            let i = 0;
            for (const d of this.description) {
                projectData.description[i] = new StringLiteral();
                projectData.description[i].language = d.language;
                projectData.description[i].value = d.value;
                i++;
            }

            this._dspApiConnection.admin.projectsEndpoint.createProject(projectData).subscribe(
                (projectResponse: ApiResponseData<ProjectResponse>) => {
                    this.project = projectResponse.body.project;
                    this.buildForm(this.project);

                    // add logged-in user to the project
                    // who am I?
                    this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this._session.getSession().user.name).subscribe(
                        (userResponse: ApiResponseData<UserResponse>) => {
                            this._dspApiConnection.admin.usersEndpoint.addUserToProjectMembership(userResponse.body.user.id, projectResponse.body.project.id).subscribe(
                                (response: ApiResponseData<UserResponse>) => {

                                    this.loading = false;
                                    this.closeDialog.emit();
                                    // redirect to (new) project page
                                    this._router.navigateByUrl('/project', { skipLocationChange: true }).then(() =>
                                        this._router.navigate(['/project/' + this.form.controls['shortcode'].value])
                                    );
                                },
                                (error: ApiResponseError) => {
                                    this._errorHandler.showMessage(error);
                                }
                            );
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                        }
                    );

                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                    this.loading = false;
                }
            );
        }
    }

    /**
     * deactivate project
     * @param id Project Iri
     */
    delete(id: string) {
        // ev.preventDefault();
        // --> TODO "are you sure?"-dialog

        // if true
        this._dspApiConnection.admin.projectsEndpoint.deleteProject(id).subscribe(
            (response: ApiResponseData<ProjectResponse>) => {
                // reload page
                this.loading = true;
                this.refresh();
            },
            (error: ApiResponseError) => {
                // const message: MessageData = error;
                this._errorHandler.showMessage(error);
                /*
                const errorRef = this._dialog.open(MessageDialogComponent, <MatDialogConfig>{
                    data: {
                        message: message
                    }
                });
                */
            }
        );

        // close dialog box

        // else: cancel action
    }

    /**
     * activate already deleted project
     *
     * @param id Project Iri
     */
    activate(id: string) {
        // hack because of issue #100 in dsp-js
        const data: UpdateProjectRequest = new UpdateProjectRequest();
        data.status = true;

        this._dspApiConnection.admin.projectsEndpoint.updateProject(id, data).subscribe(
            (response: ApiResponseData<ProjectResponse>) => {
                // reload page
                this.loading = true;
                this.refresh();
            },
            (error: ApiResponseError) => {
                // const message: MessageData = error;
                this._errorHandler.showMessage(error);
                /*
                const errorRef = this._dialog.open(MessageDialogComponent, <MatDialogConfig>{
                    data: {
                        message: message
                    }
                });
                */
            }
        );
    }

    /**
     * refresh the page after significant change (e.g. delete project)
     */
    refresh(): void {
        // refresh the component
        this.loading = true;
        // update the cache
        this._cache.del(this.projectCode);
        this._dspApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectCode).subscribe(
            (response: ApiResponseData<ProjectResponse>) => {
                this.project = response.body.project;

                this._cache.set(this.projectCode, this.project);

                this.buildForm(this.project);
                window.location.reload();
                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
                this.loading = false;
            }
        );
    }

    /**
     * @deprecated Maybe we can reactivate later.
     *
     * Reset the form
     */
    resetForm(ev: Event, project?: ReadProject) {
        ev.preventDefault();

        project = (project ? project : new ReadProject());
        this.description = project.description;

        this.buildForm(project);

        // --> TODO fix "set value" for keywords field
        //        this.form.controls['keywords'].setValue(this.keywords);
    }

}
