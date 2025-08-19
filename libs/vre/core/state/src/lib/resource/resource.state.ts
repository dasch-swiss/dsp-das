import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { SetCurrentResourceAction } from './resource.actions';
import { ResourceStateModel } from './resource.state-model';

const defaults = <ResourceStateModel>{
  resource: null, // the current resource
};

@State<ResourceStateModel>({
  defaults,
  name: 'resource',
})
@Injectable()
export class ResourceState {
  @Action(SetCurrentResourceAction)
  setCurrentOntologyAction(ctx: StateContext<ResourceStateModel>, { resource }: SetCurrentResourceAction) {
    ctx.patchState({ resource });
  }
}
