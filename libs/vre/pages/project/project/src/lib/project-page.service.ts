import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { filterNull } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { UserPermissions } from './user-permissions';

@Injectable()
export class ProjectPageService {
  private _currentProjectSubject = new BehaviorSubject<ReadProject | null>(null);
  currentProject$ = this._currentProjectSubject.asObservable().pipe(filterNull());

  private _user$ = this._store.select(UserSelectors.user).pipe(filterNull());
  private _projectAndUser$ = combineLatest([this.currentProject$, this._user$]);

  hasProjectAdminRights$ = this._projectAndUser$.pipe(
    map(([currentProject, user]) => UserPermissions.hasProjectAdminRights(user, currentProject.id))
  );

  hasProjectMemberRights$ = this._projectAndUser$.pipe(
    map(([currentProject, user]) => UserPermissions.hasProjectMemberRights(user, currentProject.id))
  );

  ontologiesMetadata$ = this.currentProject$.pipe(
    switchMap(project => this._dspApiConnection.v2.onto.getOntologiesByProjectIri(project.id)),
    map(response => response.ontologies)
  );

  ontologies$ = this.ontologiesMetadata$.pipe(
    switchMap(ontologies =>
      combineLatest(ontologies.map(onto => this._dspApiConnection.v2.onto.getOntology(onto.id, true)))
    )
  );
  constructor(
    private projectApiService: ProjectApiService,
    private _store: Store,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  setCurrentProject(projectUuid: string): void {
    this.projectApiService.get(projectUuid).subscribe(response => {
      this._currentProjectSubject.next(response.project);
    });
  }
}
