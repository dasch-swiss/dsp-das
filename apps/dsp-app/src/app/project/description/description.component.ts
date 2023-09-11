import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
    ApiResponseError,
    ReadProject
} from '@dasch-swiss/dsp-js';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import {
    Session,
    SessionService,
} from '@dasch-swiss/vre/shared/app-session';
import { ApplicationStateService } from '@dasch-swiss/vre/shared/app-state-service';

@Component({
    selector: 'app-description',
    templateUrl: './description.component.html',
    styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnInit {
    // loading for progress indicator
    loading = true;

    // permissions of the logged-in user
    session: Session;
    userIsEntitled = false;

    // project uuid coming from the route
    projectUuid: string;

    // project data to be displayed
    project: ReadProject;

    // whether the edit form is displayed or the project description
    displayEditForm = false;

    constructor(
        private _errorHandler: AppErrorHandler,
        private _session: SessionService,
        private _route: ActivatedRoute,
        private _applicationStateService: ApplicationStateService
    ) {
        // get the uuid of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectUuid = params.get('uuid');
        });
    }

    ngOnInit() {

        // get information about the logged-in user, if one is logged-in
        this.session = this._session.getSession();
        this.userIsEntitled = this.session?.user?.sysAdmin; // if the user is sysadmin, he is entitled to edit the project

        // get project info from backend
        this.initProject();
    }

    /**
     * getProject: get the project data from the application state service and update
     * if the user is entitled to edit the project if not a sysadmin
     */
    initProject() {
        // get the project data
        this._applicationStateService.get(this.projectUuid).subscribe(
            (response: ReadProject) => {
                this.project = response;

                // if the user is not entitled because not sysadmin, check if he is project admin
                if (!this.userIsEntitled) {
                    this.userIsEntitled = this.session.user.projectAdmin.some(
                        (e) => e === this.project.id
                    );
                }
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
        this.loading = false;
    }

    /**
     * onProjectFormClose: hide the edit form; refresh the project data via run
     * initProject() again if the project has been updated
     */
    onProjectFormClose(updated = false) {
        this.displayEditForm = false;
        if (updated) {
            this.initProject();
        }
    }
}
