import { Component } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { ProjectPageService } from '../project-page.service';

@Component({
  selector: 'app-projects-sidenav-ontologies',
  template: `
    @if (projectOntologies$ | async; as projectOntologies) {
      <mat-accordion>
        @for (onto of projectOntologies; let first = $first; track onto) {
          <mat-expansion-panel
            [togglePosition]="'before'"
            style="box-shadow: none"
            data-cy="sidenav-ontology"
            [expanded]="(singleOntology$ | async) && first">
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
            <app-resource-class-sidenav [ontology]="onto" style="display: block; margin-left: 40px" />
          </mat-expansion-panel>
        }
      </mat-accordion>
    } @else {
      <app-progress-indicator />
    }
  `,
  styles: [
    `
      :host ::ng-deep .mat-expansion-panel-body {
        padding: 0;
      }
    `,
  ],
  standalone: false,
})
export class ProjectSidenavOntologiesComponent {
  projectOntologies$ = this._projectPageService.ontologies$.pipe(shareReplay({ bufferSize: 1, refCount: true }));

  singleOntology$ = this.projectOntologies$.pipe(map(ontos => ontos.length === 1));
  constructor(private _projectPageService: ProjectPageService) {}

  compareElementHeights(elem: HTMLElement): boolean {
    return !(elem.scrollHeight > elem.clientHeight);
  }
}
