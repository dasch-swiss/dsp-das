import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { filter, first, map, tap } from 'rxjs';
import { CollaborationPageService } from './collaboration-page.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collaboration-page',
  template: `
    @if (isAdmin$ | async) {
      <div class="content large middle">
        @if (project$ | async; as project) {
          @if (project.status && (isAdmin$ | async) === true) {
            <app-add-user [projectUuid]="projectUuid$ | async" />
          }
        }
        @if (activeProjectMembers$ | async; as activeProjectMembers) {
          @if (inactiveProjectMembers$ | async; as inactiveProjectMembers) {
            <div style="display: flex; justify-content: center; margin: 16px 0">
              <app-double-chip-selector
              [options]="[
                'Active users (' + activeProjectMembers.length + ')',
                'Inactive users (' + inactiveProjectMembers.length + ')',
              ]"
                [(value)]="showActiveUsers" />
            </div>
            @if (showActiveUsers) {
              <app-project-members [users]="activeProjectMembers" />
            }
            @if (!showActiveUsers) {
              <app-project-members [users]="inactiveProjectMembers" />
            }
          }
        }
      </div>
    }
    
    @if ((isAdmin$ | async) === false) {
      <div class="content large middle">
        <app-status [status]="403" />
      </div>
    }
    `,
  styleUrls: ['./collaboration-page.component.scss'],
  providers: [CollaborationPageService],
})
export class CollaborationPageComponent {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  projectUuid$ = this.project$.pipe(
    tap(p => {
      this._titleService.setTitle(`Project ${p?.shortname} | Collaboration`);
    }),
    map(p => {
      return ProjectService.IriToUuid(p?.id || '');
    }),
    filter(uuid => !!uuid),
    first()
  );

  showActiveUsers = true;

  activeProjectMembers$ = this.collaborationPageService.projectMembers$.pipe(
    map(members => (members ?? []).filter(v => v.status === true))
  );
  inactiveProjectMembers$ = this.collaborationPageService.projectMembers$.pipe(
    map(members => (members ?? []).filter(v => v.status === false))
  );

  constructor(
    private _store: Store,
    protected _titleService: Title,
    public collaborationPageService: CollaborationPageService
  ) {}
}
