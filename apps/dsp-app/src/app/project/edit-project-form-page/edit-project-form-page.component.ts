import { Component, Inject, OnInit } from '@angular/core';
import {
    ApiResponseData,
    KnoraApiConnection,
    ProjectResponse,
    ReadProject,
    StringLiteral,
    UpdateProjectRequest,
} from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-edit-project-form-page',
    templateUrl: './edit-project-form-page.component.html',
})
export class EditProjectFormPageComponent implements OnInit {

    project: ReadProject;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _projectService: ProjectService) {
    }

    ngOnInit() {
        const projectIri = this._projectService.uuidToIri('00FF');
        this._dspApiConnection.admin.projectsEndpoint
            .getProjectByIri(projectIri)
            .subscribe(
                (response: ApiResponseData<ProjectResponse>) => {
                    this.project = response.body.project;
                },
            );
    }

    onSubmit(form: FormGroup) {
        const projectData: UpdateProjectRequest = {
            description: [new StringLiteral()],
            keywords: form.value.keywords,
            longname: form.value.longname,
            status: true,
        };
    }

}
