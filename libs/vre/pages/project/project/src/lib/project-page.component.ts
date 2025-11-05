import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from './project-page.service';

@Component({
  selector: 'app-project-page',
  template: `
    <app-project-page-header />
    <div class="content">
      <router-outlet />
    </div>
  `,
  styleUrls: ['./project-page.component.scss'],
  providers: [ProjectPageService],
  standalone: false,
})
export class ProjectPageComponent implements OnInit {
  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;

  protected readonly RouteConstants = RouteConstants;

  constructor(
    protected _route: ActivatedRoute,
    private _titleService: Title,
    private _projectPageService: ProjectPageService
  ) {}

  ngOnInit() {
    this._projectPageService.setup(this._route.snapshot.params[RouteConstants.uuidParameter]);

    this._projectPageService.currentProject$.subscribe(project => {
      if (project.id !== this._projectPageService.currentProjectId) {
        // TODO: handle project not found
      }
      this._titleService.setTitle(project.shortname);
    });
  }
}
