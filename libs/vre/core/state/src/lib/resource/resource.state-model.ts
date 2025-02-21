import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IKeyValuePairs } from '../model-interfaces';

export class ResourceStateModel {
  isLoading = false;
  attachedUsers: IKeyValuePairs<ReadUser> = {};
  attachedProjects: IKeyValuePairs<ReadProject> = {};
  selectedResource: DspResource | null = null;
}
