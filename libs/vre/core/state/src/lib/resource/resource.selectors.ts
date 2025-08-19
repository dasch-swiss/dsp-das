import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Selector } from '@ngxs/store';
import { IKeyValuePairs } from '../model-interfaces';
import { ResourceState } from './resource.state';
import { ResourceStateModel } from './resource.state-model';

export class ResourceSelectors {
  @Selector([ResourceState])
  static attachedUsers(state: ResourceStateModel): IKeyValuePairs<ReadUser> {
    return state.attachedUsers;
  }

  @Selector([ResourceState])
  static attachedProjects({ attachedProjects }: ResourceStateModel): IKeyValuePairs<ReadProject> {
    return Object.keys(attachedProjects)
      .filter(key => attachedProjects[key] && Object.values(attachedProjects[key]).length > 0)
      .reduce((acc, key) => ({ ...acc, [key]: attachedProjects[key] }), {} as IKeyValuePairs<ReadProject>);
  }

  @Selector([ResourceState])
  static resource(state: ResourceStateModel): DspResource | null {
    return state.resource;
  }
}
