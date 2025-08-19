import { Injectable } from '@angular/core';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AllProjectsService {
  allProjects$ = this._store.select(ProjectsSelectors.allProjects);
  otherProjects$ = combineLatest([this._store.select(UserSelectors.userActiveProjects), this.allProjects$]).pipe(
    map(([userActiveProjects, projects]) => {
      return projects.filter(project => userActiveProjects.findIndex(userProj => userProj.id === project.id) === -1);
    })
  );
  allActiveProjects$ = this.allProjects$.pipe(
    map(projects =>
      projects.filter(project => project.status).sort((a, b) => (a.longname || '').localeCompare(b.longname || ''))
    )
  );

  allInactiveProjects$ = this.allProjects$.pipe(
    map(projects =>
      projects.filter(project => !project.status).sort((a, b) => (a.longname || '').localeCompare(b.longname || ''))
    )
  );

  constructor(private _store: Store) {}
}
