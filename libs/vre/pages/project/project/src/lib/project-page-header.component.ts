import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { HeaderLogoComponent, HeaderUserActionsComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { map } from 'rxjs';
import { ProjectNavigationTabsComponent } from './project-navigation-tabs.component';
import { ProjectPageService } from './project-page.service';

@Component({
  selector: 'app-project-page-header',
  template: ` <mat-toolbar style="background-color: inherit; height: 56px">
      <span style="flex: 1; display: flex">
        <app-header-logo />
        <a matButton="text" class="mat-title-medium" [routerLink]="projectLink$ | async">{{
          currentProjectName$ | async
        }}</a>
      </span>
      <app-header-user-actions />
    </mat-toolbar>
    <app-project-navigation-tabs />`,
  imports: [
    AsyncPipe,
    MatToolbar,
    RouterLink,
    HeaderLogoComponent,
    HeaderUserActionsComponent,
    ProjectNavigationTabsComponent,
    MatButton,
  ],
})
export class ProjectPageHeaderComponent {
  currentProjectName$ = this._projectService.currentProject$.pipe(map(project => project.longname));
  projectLink$ = this._projectService.currentProject$.pipe(
    map(project => ['/project', ProjectService.IriToUuid(project.id)])
  );

  constructor(private readonly _projectService: ProjectPageService) {}
}
