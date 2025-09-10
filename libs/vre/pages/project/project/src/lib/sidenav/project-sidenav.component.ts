import { Component } from '@angular/core';

@Component({
  selector: 'app-project-sidenav',
  template: ` <app-projects-sidenav-ontologies /> `,
  styles: [
    `
      :host {
        width: 290px;
        display: block;
        border-right: 1px solid #ebebeb;
        overflow: auto;
      }
    `,
  ],
})
export class ProjectSidenavComponent {}
