import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { IKeyValuePairs, LoadProjectMembersAction, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss'],
})
export class CollaborationComponent implements OnInit, OnDestroy {
  @Select(ProjectsSelectors.currentProject) project$!: Observable<ReadProject>;
  @Select(ProjectsSelectors.projectMembers) projectMembers$!: Observable<IKeyValuePairs<ReadUser>>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isAdmin$!: Observable<boolean>;

  projectUuid$!: Observable<string>;

  private _destroy = new Subject<void>();

  get activeProjectMembers$(): Observable<ReadUser[]> {
    return combineLatest([this.project$, this.projectMembers$]).pipe(
      map(([currentProject, projectMembers]) => {
        return projectMembers[currentProject.id]?.value.filter(member => member?.status === true) || [];
      })
    );
  }

  get inactiveProjectMembers$(): Observable<ReadUser[]> {
    return combineLatest([this.project$, this.projectMembers$]).pipe(
      map(([currentProject, projectMembers]) => {
        return projectMembers[currentProject?.id].value.filter(member => member?.status === false) || [];
      })
    );
  }

  constructor(
    private _store: Store,
    protected _titleService: Title
  ) {}

  ngOnInit() {
    this.projectUuid$ = this.project$.pipe(
      map(p => {
        return ProjectService.IriToUuid(p?.id);
      })
    );
    this.project$.pipe(takeUntil(this._destroy)).subscribe(p => {
      const projectUuid = ProjectService.IriToUuid(p?.id);
      if (projectUuid) {
        this._store.dispatch(new LoadProjectMembersAction(projectUuid));
      }
      this._titleService.setTitle(`Project ${p?.shortname} | Collaboration`);
    });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
