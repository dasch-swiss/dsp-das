import { UpdateProjectRequest } from '@dasch-swiss/dsp-js';

export class LoadProjectsAction {
  static readonly type = '[Projects] Load Projects';
}

export class LoadProjectAction {
  static readonly type = '[Projects] Load Project';

  constructor(
    public projectUuid: string,
    public loadMembership = true
  ) {}
}

export class ClearProjectsAction {
  static readonly type = '[Projects] Clear projects';
}

export class UpdateProjectAction {
  static readonly type = '[Projects] Update Project';

  constructor(
    public projectUuid: string,
    public projectData: UpdateProjectRequest
  ) {}
}
