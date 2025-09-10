import { Component } from '@angular/core';
import { map } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Component({
  selector: 'app-header-project',
  template: ` <mat-toolbar style="background-color: white">
      <span style="flex: 1; display: flex; align-items: center">
        <app-header-logo />
        <h1>{{ currentProjectName$ | async }}</h1>
      </span>
      <app-header-right />
    </mat-toolbar>
    <app-header-tabs />`,
  styles: [
    `
      :host {
        display: block;
        border-bottom: 1px solid #ebebeb;
      }
    `,
  ],
})
export class HeaderProjectComponent {
  currentProjectName$ = this._projectService.currentProject$.pipe(map(project => project.longname));
  constructor(private _projectService: ProjectPageService) {}
}
