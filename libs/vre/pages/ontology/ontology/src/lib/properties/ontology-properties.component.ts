import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { PropertyInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';
import { PropertyInfoComponent } from './property-info/property-info.component';

@Component({
  selector: 'app-ontology-properties',
  template: `
    <app-centered-layout>
      <h2 class="mat-headline-medium">List of properties</h2>
      <mat-card appearance="outlined">
        <mat-card-content>
          @for (prop of oes.currentOntologyProperties$ | async; track trackByPropertyDefinitionFn($index, prop)) {
            <div [class.admin]="(hasProjectAdminRights$ | async) === true">
              <app-property-info [property]="prop" />
            </div>
          }
        </mat-card-content>
      </mat-card>
    </app-centered-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, PropertyInfoComponent, MatCard, MatCardContent, CenteredLayoutComponent],
})
export class OntologyPropertiesComponent {
  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;

  trackByPropertyDefinitionFn = (index: number, item: PropertyInfo) => `${index}-${item.propDef.id}`;

  constructor(
    public oes: OntologyEditService,
    private readonly _projectPageService: ProjectPageService
  ) {}
}
