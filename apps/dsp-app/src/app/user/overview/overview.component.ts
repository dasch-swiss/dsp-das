import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ReadProject, ReadUser, StoredProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { LoadProjectsAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select, Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { HttpRefresher } from '../../../../../../libs/vre/shared/app-api/src/lib/services/admin/http-refresher.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  @Select(UserSelectors.user) user$: Observable<ReadUser>;
  // list of projects a user is a member of
  @Select(UserSelectors.userActiveProjects) userActiveProjects$: Observable<StoredProject[]>;
  @Select(ProjectsSelectors.otherProjects) userOtherActiveProjects$: Observable<StoredProject[]>;
  @Select(ProjectsSelectors.allProjects) allProjects$: Observable<StoredProject[]>;
  @Select(ProjectsSelectors.allActiveProjects) allActiveProjects$: Observable<ReadProject[]>;
  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;

  projects$ = this._httpRefresher.get('PROJECT').pipe(
    tap(v => console.log('passed the refresher', v)),
    switchMap(() => this._projectApiService.list()),
    tap(
      v => console.log('data received from ApiService', v),
      e => console.log('g', e)
    ),
    map(v => v.projects)
  );
  constructor(
    private _titleService: Title,
    private _router: Router,
    private _store: Store,
    private _projectApiService: ProjectApiService,
    private _httpRefresher: HttpRefresher
  ) {
    this._titleService.setTitle('Projects Overview');
  }

  refresh() {
    this._projectApiService
      .create({
        shortname: `aa${this.generateRandomString()}`,
        longname: this.generateRandomString(),
        keywords: ['keyword'],
        description: [{ language: 'de', value: 'description' }],
        shortcode: this.generateRandomString(),
        selfjoin: true,
        status: true,
      })
      .subscribe(() => {
        this._httpRefresher.update('PROJECT');
      });
  }

  generateRandomString(): string {
    const characters = '0123';
    let result = '';

    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }
  ngOnInit() {
    this._loadProjects();
  }

  createNewProject() {
    this._router.navigate([RouteConstants.newProjectRelative]);
  }

  trackByFn = (index: number, item: StoredProject) => `${index}-${item.id}`;

  private _loadProjects(): void {
    combineLatest([this.isProjectsLoading$, this.allProjects$])
      .pipe(
        filter(([isProjectsLoading]) => isProjectsLoading === false),
        take(1)
      )
      .subscribe(([isProjectsLoading, allProjects]) => {
        if (allProjects.length === 0) {
          this._store.dispatch(new LoadProjectsAction());
        }
      });
  }
}
