import { Injectable } from '@angular/core';
import {
    Constants,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';

@Injectable({
    providedIn: 'root',
})
/**
 * Project Service is helper service to provide project related methods
 * @export
 * @class ProjectService
 */
export class ProjectService {
    constructor(
        private _acs: AppConfigService,
    ) {}

    iriToUuid(iri: string): string {
        if (iri) {
            const array = iri.split('/');
            return array[array.length - 1];
        }

        return '';
    }

    static IriToUuid(iri: string): string {
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

    //TODO remove non static methods
    isInProjectGroup = (userProjectGroups: string[], projectUuid: string): boolean => 
        ProjectService.IsInProjectGroup(userProjectGroups, projectUuid);
    static IsInProjectGroup = (userProjectGroups: string[], projectUuid: string): boolean =>
        userProjectGroups.some((e) => ProjectService.IriToUuid(e) === projectUuid);

    isMemberOfProjectAdminGroup = (groupsPerProject: {[key: string]: string[]}, projectIri: string): boolean => 
        ProjectService.IsMemberOfProjectAdminGroup(groupsPerProject, projectIri);
    static IsMemberOfProjectAdminGroup = (groupsPerProject: {[key: string]: string[]}, projectIri: string): boolean =>
        groupsPerProject
        && groupsPerProject[projectIri] 
        && (groupsPerProject[projectIri].indexOf(Constants.ProjectAdminGroupIRI) > -1);

    isMemberOfSystemAdminGroup = (groupsPerProject: {[key: string]: string[]}): boolean => ProjectService.IsMemberOfSystemAdminGroup(groupsPerProject);
    static IsMemberOfSystemAdminGroup = (groupsPerProject: {[key: string]: string[]}): boolean =>
        groupsPerProject
        && groupsPerProject[Constants.SystemProjectIRI] 
        && (groupsPerProject[Constants.SystemProjectIRI].indexOf(Constants.SystemAdminGroupIRI) > -1);


    isProjectAdmin = (groupsPerProject: {[key: string]: string[]}, userProjectGroups: string[], projectIri: string): boolean => 
        ProjectService.IsProjectAdmin(groupsPerProject, userProjectGroups, projectIri);
    static IsProjectAdmin(groupsPerProject: {[key: string]: string[]}, userProjectGroups: string[], projectIri: string): boolean
    {
        const isMemberOfProjectAdminGroup = ProjectService.IsMemberOfProjectAdminGroup(groupsPerProject, projectIri);
        return ProjectService.IsInProjectGroup(userProjectGroups, projectIri) || isMemberOfProjectAdminGroup;
    }

    isProjectAdminOrSysAdmin = (user: ReadUser, userProjectGroups: string[], projectIri: string): boolean => 
        ProjectService.IsProjectAdminOrSysAdmin(user, userProjectGroups, projectIri);
    static IsProjectAdminOrSysAdmin(user: ReadUser, userProjectGroups: string[], projectIri: string): boolean
    {
        if (!user || !projectIri) {
            return false;
        }

        const groupsPerProject = user.permissions.groupsPerProject ? user.permissions.groupsPerProject : {};
        return ProjectService.IsProjectOrSysAdmin(groupsPerProject, userProjectGroups, projectIri);
    }
    
    isProjectOrSysAdmin = (groupsPerProject: {[key: string]: string[]}, userProjectGroups: string[], projectIri: string): boolean => 
        ProjectService.IsProjectOrSysAdmin(groupsPerProject, userProjectGroups, projectIri);
    static IsProjectOrSysAdmin(groupsPerProject: {[key: string]: string[]}, userProjectGroups: string[], projectIri: string): boolean
    {
        const isMemberOfSystemAdminGroup = ProjectService.IsMemberOfSystemAdminGroup(groupsPerProject);
        return ProjectService.IsProjectAdmin(groupsPerProject, userProjectGroups, projectIri) || isMemberOfSystemAdminGroup;
    }

    isProjectMember = (user: ReadUser, userProjectGroups: string[], projectUuid: string): boolean => 
        ProjectService.IsProjectMember(user, userProjectGroups, projectUuid);
    static IsProjectMember(user: ReadUser, userProjectGroups: string[], projectUuid: string): boolean
    {
        const isProjectAdmin = ProjectService.IsInProjectGroup(userProjectGroups, projectUuid);
        return isProjectAdmin
            // check if the user is member of the current project(id contains the iri)
            ? true
            : user.projects.length === 0 ? false : user.projects.some((p) => ProjectService.IriToUuid(p.id) === projectUuid);
    }
}
