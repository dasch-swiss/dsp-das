import { Component } from '@angular/core';

@Component({
  selector: 'app-projects-sidenav-link-objects',
  template: ` <mat-accordion>
    <mat-expansion-panel [togglePosition]="'before'" style="box-shadow: none">
      <mat-expansion-panel-header>
        <mat-panel-title #ontoTitle matTooltipShowDelay="500" matTooltipPosition="right"> Collections </mat-panel-title>
      </mat-expansion-panel-header>
      <app-resource-class-sidenav [ontology]="onto" style="display: block; margin-left: 16px" />
    </mat-expansion-panel>
  </mat-accordion>`,
})
export class ProjectSidenavLinkObjectsComponent {}
