import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiResponseData, KnoraApiConnection, ProjectsResponse, StoredProject } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-select-project',
    templateUrl: './select-project.component.html',
    styleUrls: ['./select-project.component.scss']
})
export class SelectProjectComponent implements OnInit, OnDestroy {

    @Input() formGroup: FormGroup;

    @Input() usersProjects: StoredProject[];

    @Input() systemAdmin: boolean;

    @Output() projectSelected = new EventEmitter<string>();

    form: FormGroup;

    projectChangesSubscription: Subscription;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        @Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit(): void {

        // build a form for the named graph selection
        this.form = this._fb.group({
            projects: [null, Validators.required]
        });

        // emit Iri of the project when selected
        this.projectChangesSubscription = this.form.valueChanges.subscribe((data) => {
            this.projectSelected.emit(data.projects);
        });

        // add form to the parent form group
        this.formGroup.addControl('projects', this.form);

        // if there is only one project to choose from, select it automatically
        if (this.usersProjects.length === 1) {
            this.form.controls.projects.setValue(this.usersProjects[0].id);
        }

        // if the user is system admin, show all projects in the select dropdown
        if (this.systemAdmin === true) {
            this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
                (response: ApiResponseData<ProjectsResponse>) => {
                    this.usersProjects = response.body.projects;
                });
        }

    }

    ngOnDestroy() {
        if (this.projectChangesSubscription !== undefined) {
            this.projectChangesSubscription.unsubscribe();
        }
    }

}
