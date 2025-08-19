import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Selector } from '@ngxs/store';
import { ResourceState } from './resource.state';
import { ResourceStateModel } from './resource.state-model';

export class ResourceSelectors {
  @Selector([ResourceState])
  static resource(state: ResourceStateModel): DspResource | null {
    return state.resource;
  }
}
