import { Component } from '@angular/core';
import { OntologiesSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-projects-sidenav-ontologies',
  template: `
    <mat-accordion *ngFor="let onto of projectOntologies$ | async; let first = first" [displayMode]="'flat'">
      <mat-expansion-panel [expanded]="first">
        <mat-expansion-panel-header>
          <div class="sidenav-panel-header">
            <mat-panel-title class="mat-subtitle-1">
              <p
                #ontoTitle
                matTooltip="{{ onto.label }}"
                matTooltipShowDelay="500"
                matTooltipPosition="right"
                [matTooltipDisabled]="compareElementHeights(ontoTitle)">
                {{ onto.label }}
              </p>
            </mat-panel-title>
          </div>
        </mat-expansion-panel-header>
        <!-- list of ontology classes -->
        <app-resource-class-sidenav [ontology]="onto" />
      </mat-expansion-panel>
      <mat-divider />
    </mat-accordion>
  `,
})
export class ProjectSidenavOntologiesComponent {
  projectOntologies$ = this._store.select(OntologiesSelectors.currentProjectOntologies);

  constructor(private _store: Store) {}

  compareElementHeights(elem: HTMLElement): boolean {
    return !(elem.scrollHeight > elem.clientHeight);
  }
}
