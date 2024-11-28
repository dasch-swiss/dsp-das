import { ProjectRestrictedViewSettings, ReadGroup, ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { RestrictedViewResponse } from '@dasch-swiss/vre/open-api';
import { IKeyValuePair, IKeyValuePairs } from '../model-interfaces';

export class ProjectsStateModel {
  isLoading = false;
  isMembershipLoading = false; // loading state of project membership
  hasLoadingErrors = false; // loading error state
  allProjects: ReadProject[] = []; // all projects in the system grouped by project IRI
  projectMembers: IKeyValuePairs<ReadUser> = {}; // project members grouped by project IRI
  projectGroups: IKeyValuePairs<ReadGroup> = {}; // project user groups grouped by project IRI
  projectRestrictedViewSettings: IKeyValuePair<ProjectRestrictedViewSettings | RestrictedViewResponse> = {}; // project image settings grouped by project id
}
