import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { State } from '@ngxs/store';
import { ProjectsStateModel } from './projects.state-model';

const defaults: ProjectsStateModel = {
  isLoading: false,
  allProjects: [], // all projects in the system grouped by project IRI
};

/*
  Provides data about projects, including their members, user groups, and settings.
*/
@State<ProjectsStateModel>({
  defaults,
  name: 'projects',
})
@Injectable()
export class ProjectsState {
  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private projectService: ProjectService,
    private projectApiService: ProjectApiService
  ) {}
}
