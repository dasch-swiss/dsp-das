import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ReadProject, ReadUser, StoredProject } from '@dasch-swiss/dsp-js';
import { ReplaceAnimation } from '@dasch-swiss/vre/shared/app-common';
import { LoadProjectsAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { Select, Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [ReplaceAnimation.animation],
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

  loadingTiles = new Array(8);

  constructor(
    private _titleService: Title,
    private _router: Router,
    private _store: Store
  ) {
    this._titleService.setTitle('Projects Overview');
  }

  ngOnInit() {
    this._loadProjects();
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
