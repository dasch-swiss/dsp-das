import { Inject, Injectable } from '@angular/core';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    KnoraApiConnection,
    ProjectsResponse,
    Permissions,
    ReadUser,
    StoredProject,
    User,
} from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { ApplicationStateService } from '@dasch-swiss/vre/shared/app-state-service';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { SessionService } from '@dasch-swiss/vre/shared/app-session';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _applicationStateService: ApplicationStateService,
        private _errorHandler: AppErrorHandler,
        private _session: SessionService,
        private _acs: AppConfigService
    ) {}

    /**
     * initializes projects
     * @returns projects
     */
    initializeProjects(): Observable<StoredProject[]> {
        const usersProjects: StoredProject[] = [];

        // get info about logged-in user from the session object
        const session = this._session.getSession();

        if (session.user.sysAdmin === false) {
            return this._applicationStateService
                .get(session.user.name)
                .pipe(
                    map(
                        (user: ReadUser) => {
                            for (const project of user.projects) {
                                if (project.status) {
                                    usersProjects.push(project);
                                }
                            }
                            return <StoredProject[]>usersProjects;
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                            return <StoredProject[]>[];
                        }
                    )
                );
        } else {
            return this._dspApiConnection.admin.projectsEndpoint
                .getProjects()
                .pipe(
                    map(
                        (response: ApiResponseData<ProjectsResponse>) => {
                            for (const project of response.body.projects) {
                                if (
                                    project.status &&
                                    project.id !== Constants.SystemProjectIRI &&
                                    project.id !==
                                        Constants.DefaultSharedOntologyIRI
                                ) {
                                    usersProjects.push(project);
                                }
                            }
                            return <StoredProject[]>usersProjects;
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                            return <StoredProject[]>[];
                        }
                    )
                );
        }
    }

    iriToUuid(iri: string): string {
        if (iri) {
            const array = iri.split('/');
            return array[array.length - 1];
        }

        return '';
    }

    uuidToIri(uuid: string): string {
        if (uuid && !uuid.startsWith(this._acs.dspAppConfig.iriBase)) {
            return `${this._acs.dspAppConfig.iriBase}/projects/${uuid}`;
        } 

        return uuid;
    }

    isInProjectGroup = (userProjectGroups: string[], projectUuid: string): boolean =>
        userProjectGroups.some((e) => e === this.uuidToIri(projectUuid));


    isProjectAdmin(groupsPerProject: {[key: string]: string[]}, userProjectGroups: string[], projectIri: string): boolean
    {
        const isMemberOfProjectAdminGroup = 
                groupsPerProject
                && groupsPerProject[projectIri] 
                && (groupsPerProject[projectIri].indexOf(Constants.ProjectAdminGroupIRI) > -1);

        return this.isInProjectGroup(userProjectGroups, projectIri) || isMemberOfProjectAdminGroup;
    }

    isProjectAdminOrSysAdmin(user: ReadUser, userProjectGroups: string[], projectIri: string): boolean
    {
        return user && this.isProjectOrSysAdmin(user.permissions.groupsPerProject, userProjectGroups, projectIri);
    }
    
    isProjectOrSysAdmin(groupsPerProject: {[key: string]: string[]}, userProjectGroups: string[], projectIri: string): boolean
    {
        const isMemberOfSystemAdminGroup = 
                groupsPerProject
                && groupsPerProject[Constants.SystemProjectIRI] 
                && (groupsPerProject[Constants.SystemProjectIRI].indexOf(Constants.SystemAdminGroupIRI) > -1);

        return this.isProjectAdmin(groupsPerProject, userProjectGroups, projectIri) || isMemberOfSystemAdminGroup;
    }

    isProjectMember(user: ReadUser, userProjectGroups: string[], projectUuid: string): boolean
    {
        const isProjectAdmin = this.isInProjectGroup(userProjectGroups, projectUuid);
        const iri = this.uuidToIri(projectUuid);
        return isProjectAdmin
            // check if the user is member of the current project(id contains the iri)
            ? true
            : user.projects.length === 0 ? false : user.projects.some((p) => p.id === iri);
    }
}
