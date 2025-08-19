import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StoredProject } from '@dasch-swiss/dsp-js';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { LoadUserAction, UserSelectors } from '@dasch-swiss/vre/core/state';
import { AllProjectsService } from '@dasch-swiss/vre/pages/user-settings/user';
import { Store } from '@ngxs/store';
import { combineLatest, map, Observable, Subject, takeUntil, tap } from 'rxjs';

/**
 * ProjectsComponent handles the list of projects.
 * It's used in user-profile, on system-projects but also on the landing page.
 * We build two lists: one with active projects and another one with deactivated projects.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-projects',
  template: `
    @if (loading) {
      <app-progress-indicator />
    } @else {
      <div class="app-projects">
        <app-projects-list
          [projectsList]="activeProjects$ | async"
          [isUserActive]="true"
          (refreshParent)="updateAndRefresh()"
          [createNewButtonEnabled]="true"
          [isUsersProjects]="isUsersProjects"
          data-cy="active-projects-section" />
        <app-projects-list
          [projectsList]="inactiveProjects$ | async"
          [isUserActive]="false"
          [isUsersProjects]="isUsersProjects"
          (refreshParent)="updateAndRefresh()"
          data-cy="inactive-projects-section" />
      </div>
    }
  `,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private _ngUnsubscribe = new Subject<void>();

  @Input() isUsersProjects = false;

  get activeProjects$(): Observable<StoredProject[]> {
    return combineLatest([this.userActiveProjects$, this.allActiveProjects$]).pipe(
      takeUntil(this._ngUnsubscribe),
      map(([userActiveProjects, allActiveProjects]) => (this.isUsersProjects ? userActiveProjects : allActiveProjects))
    );
  }

  get inactiveProjects$(): Observable<StoredProject[]> {
    return combineLatest([this.userInactiveProjects$, this.allInactiveProjects$]).pipe(
      takeUntil(this._ngUnsubscribe),
      map(([userInactiveProjects, allInactiveProjects]) =>
        this.isUsersProjects ? userInactiveProjects : allInactiveProjects
      )
    );
  }

  userActiveProjects$ = this._store.select(UserSelectors.userActiveProjects);
  userInactiveProjects$ = this._store.select(UserSelectors.userInactiveProjects);
  allActiveProjects$ = this._allProjectsService.allActiveProjects$.pipe(
    tap(() => {
      this.loading = false;
    })
  );
  allInactiveProjects$ = this._allProjectsService.allInactiveProjects$;

  loading = true;

  constructor(
    private _store: Store,
    private _allProjectsService: AllProjectsService,
    private _titleService: Title
  ) {}

  ngOnInit() {
    this._titleService.setTitle(this.isUsersProjects ? 'Your projects' : 'All projects from DSP');
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  updateAndRefresh() {
    const currentUser = this._store.selectSnapshot(UserSelectors.user);
    if (!currentUser) throw new AppError('Current user not found.');
    this._store.dispatch(new LoadUserAction(currentUser.username));
  }
}
