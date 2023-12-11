import { ReadGroup, ReadProject } from '@dasch-swiss/dsp-js';

export class CurrentProjectStateModel {
  isLoading = false;
  hasLoadingErrors = false;
  project: ReadProject | undefined;
  isProjectAdmin = false;
  isProjectMember = false;
  groups: ReadGroup[] = [];
}
