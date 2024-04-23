import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { IKeyValuePairs } from '../model-interfaces';

export class ReourceStateModel {
  showAllProps = false;
  showAllComments = false;
  isLoading = false;
  attachedUsers: IKeyValuePairs<ReadUser> = {};
  attachedProjects: IKeyValuePairs<ReadProject> = {};
  resource: DspResource | null = null;
}
