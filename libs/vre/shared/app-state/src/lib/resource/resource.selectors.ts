import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Selector } from '@ngxs/store';
import { IKeyValuePairs } from '../model-interfaces';
import { ResourceState } from './resource.state';
import { ReourceStateModel } from './resource.state-model';

export class ResourceSelectors {
  @Selector([ResourceState])
  static attachedUsers(state: ReourceStateModel): IKeyValuePairs<ReadUser> {
    return state.attachedUsers;
  }

  @Selector([ResourceState])
  static attachedProjects(state: ReourceStateModel): IKeyValuePairs<ReadProject> {
    return state.attachedProjects;
  }

  @Selector([ResourceState])
  static resource(state: ReourceStateModel): DspResource | null {
    return state.resource;
  }
}
