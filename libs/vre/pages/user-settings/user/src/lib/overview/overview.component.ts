import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoredProject } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { LoadProjectsAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('filterInput') filterInput!: ElementRef;
  private _filter$ = new BehaviorSubject<string>('');

  activeProjects$ = combineLatest([this._store.select(ProjectsSelectors.allActiveProjects), this._filter$]).pipe(
    map(([projects, searchTerm]) => projects.filter(p => this.matchesSearchTerm(p, searchTerm)))
  );

  usersActiveProjects$ = combineLatest([this._store.select(UserSelectors.userActiveProjects), this._filter$]).pipe(
    map(([projects, searchTerm]) => projects.filter(p => this.matchesSearchTerm(p, searchTerm)))
  );

  notUsersActiveProjects$ = combineLatest([this._store.select(ProjectsSelectors.otherProjects), this._filter$]).pipe(
    map(([projects, searchTerm]) => projects.filter(p => this.matchesSearchTerm(p, searchTerm)))
  );

  userHasProjects$ = this.usersActiveProjects$.pipe(map(projects => projects.length > 0));

  loading$ = this._store.select(ProjectsSelectors.isProjectsLoading);

  constructor(
    private _router: Router,
    private _store: Store
  ) {}

  ngOnInit() {
    this._store.dispatch(new LoadProjectsAction());
  }

  ngAfterViewInit(): void {
    this.filterInput.nativeElement.focus();
  }

  filterProjects(value: string) {
    this._filter$.next(value);
  }

  private matchesSearchTerm(project: StoredProject, searchTerm: string): boolean {
    const lower = searchTerm.toLowerCase();
    return (
      project.longname?.toLowerCase().includes(lower) ||
      project.shortcode.toLowerCase().includes(lower) ||
      project.shortname.toLowerCase().includes(lower)
    );
  }

  trackByFn = (index: number, item: StoredProject) => `${index}-${item.id}`;

  navigateToProject(id: string) {
    this._router.navigate([RouteConstants.project, ProjectService.IriToUuid(id)]);
  }
}
