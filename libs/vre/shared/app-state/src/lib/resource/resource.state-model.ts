import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { IKeyValuePairs } from '../model-interfaces';

export class ResourceStateModel {
  isLoading = false;
  attachedUsers: IKeyValuePairs<ReadUser> = {}; // users attached to a resource
  attachedProjects: IKeyValuePairs<ReadProject> = {}; // projects attached to a resource
  resource: DspResource | null = null; // the current resource
}
