import { ReadProject } from '@dasch-swiss/dsp-js';

export class ProjectsStateModel {
  isLoading = false;
  allProjects: ReadProject[] = [];
}
