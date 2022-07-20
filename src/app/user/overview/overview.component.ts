import { Component, Inject, OnInit } from '@angular/core';
import { KnoraApiConnection, ApiResponseData, UserResponse, ApiResponseError, StoredProject, ProjectsResponse } from '@dasch-swiss/dsp-js';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/services/error-handler.service';
import { Session, SessionService } from 'src/app/main/services/session.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

    loading = true;

    session: Session;
    username: string;
    sysAdmin = false;

    // list of projects a user is a member of
    userProjects: StoredProject[] = [];

    // list of projects a user is NOT a member of
    otherProjects: StoredProject[] = [];

    // list of all projects
    allProjects: StoredProject[] = [];

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _errorHandler: ErrorHandlerService,
        private _session: SessionService,
    ) {
        // get username
        this.session = this._session.getSession();
        this.username = this.session.user.name;
        this.sysAdmin = this.session.user.sysAdmin;
    }

    ngOnInit() {

        this.loading = true;

        // set the cache
        this._cache.get(this.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username));

        if (this.sysAdmin) {
            // logged-in user is system admin: show all projects
            this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
                (response: ApiResponseData<ProjectsResponse>) => {

                    // reset the list:
                    this.allProjects = [];

                    for (const project of response.body.projects) {
                        this.allProjects.push(project);
                    }

                    this.loading = false;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        } else {
            // logged-in user is NOT a system admin: get all projects the user is a member of
            this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username).subscribe(
                (userResponse: ApiResponseData<UserResponse>) => {

                    // clean up list of projects
                    this.userProjects = [];
                    this.otherProjects = [];

                    // get list of all projects the user is a member of
                    for (const project of userResponse.body.user.projects) {
                        this.userProjects.push(project);
                    }

                    this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
                        (projectsResponse: ApiResponseData<ProjectsResponse>) => {

                            console.log('userProjects: ', this.userProjects);

                            // get list of all projects the user is NOT a member of
                            for (const project of projectsResponse.body.projects) {
                                if(this.userProjects.findIndex(userProj => userProj.id === project.id) === -1){
                                    this.otherProjects.push(project);
                                }
                            }
                            console.log('otherProjects: ', this.otherProjects);
                            this.loading = false;
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                        }
                    );

                    this.loading = false;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }
    }

}
