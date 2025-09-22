import { Component } from '@angular/core';

@Component({
  selector: 'app-project-sidenav',
  template: ` <app-projects-sidenav-ontologies />
    <app-project-sidenav-link-objects />`,
  styles: [
    `
      :host {
        flex-basis: 500px;
        flex-shrink: 0;
        display: block;
        border-right: 1px solid #ebebeb;
        overflow: auto;
      }
    `,
  ],
})
export class ProjectSidenavComponent {}
