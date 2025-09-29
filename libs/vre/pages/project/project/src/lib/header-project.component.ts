import { Component } from '@angular/core';
import { map } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Component({
  selector: 'app-header-project',
  template: ` <mat-toolbar style="background-color: inherit; height: 56px">
      <span style="flex: 1; display: flex; align-items: center">
        <app-header-logo />
        <h1 style="font-size: 18px">{{ currentProjectName$ | async }}</h1>
      </span>
      <app-header-right />
    </mat-toolbar>
    <app-header-project-tabs />`,
  styles: [
    `
      :host {
        display: block;
        border-bottom: 1px solid #ebebeb;
        background-color: #fcfdff;
      }
    `,
  ],
  standalone: false,
})
export class HeaderProjectComponent {
  currentProjectName$ = this._projectService.currentProject$.pipe(map(project => project.longname));
  constructor(private _projectService: ProjectPageService) {}
}
