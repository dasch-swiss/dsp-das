import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { ProjectPageService } from '../project-page.service';
import { ProjectSidenavLinksComponent } from './project-sidenav-links.component';
import { ProjectSidenavOntologiesComponent } from './project-sidenav-ontologies.component';

@Component({
  selector: 'app-project-sidenav',
  template: `
    @if (currentProject$ | async; as currentProject) {
      <div class="project-title">{{ currentProject.longname }}</div>
    }
    <mat-divider />
    <app-projects-sidenav-links />
    <mat-divider />
    <app-projects-sidenav-ontologies />
  `,
  styles: [
    `
      :host {
        width: 290px;
        display: block;
      }

      .project-title {
        padding: 20px 16px 20px 16px;
        font-size: 24px;
        margin: 0;
      }
    `,
  ],
  standalone: true,
  imports: [MatDivider, ProjectSidenavLinksComponent, ProjectSidenavOntologiesComponent, AsyncPipe],
})
export class ProjectSidenavComponent {
  currentProject$ = this._projectPageService.currentProject$;

  constructor(private _projectPageService: ProjectPageService) {}
}
