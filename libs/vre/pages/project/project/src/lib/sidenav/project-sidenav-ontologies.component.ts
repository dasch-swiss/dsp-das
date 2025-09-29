import { Component } from '@angular/core';
import { ProjectPageService } from '../project-page.service';

@Component({
  selector: 'app-projects-sidenav-ontologies',
  template: `
    @for (onto of projectOntologies$ | async; track onto) {
      <mat-accordion>
        <mat-expansion-panel [togglePosition]="'before'" style="box-shadow: none" data-cy="sidenav-ontology">
          <mat-expansion-panel-header>
            <mat-panel-title
              #ontoTitle
              matTooltip="{{ onto.label }}"
              matTooltipShowDelay="500"
              matTooltipPosition="right"
              [matTooltipDisabled]="compareElementHeights(ontoTitle)">
              {{ onto.label }}
            </mat-panel-title>
          </mat-expansion-panel-header>
          <app-resource-class-sidenav [ontology]="onto" style="display: block; margin-left: 16px" />
        </mat-expansion-panel>
      </mat-accordion>
    }
  `,
  styles: [
    `
      :host ::ng-deep .mat-expansion-panel-body {
        padding: 0 8px;
      }
    `,
  ],
  standalone: false,
})
export class ProjectSidenavOntologiesComponent {
  projectOntologies$ = this._projectPageService.ontologies$;

  constructor(private _projectPageService: ProjectPageService) {}

  compareElementHeights(elem: HTMLElement): boolean {
    return !(elem.scrollHeight > elem.clientHeight);
  }
}
