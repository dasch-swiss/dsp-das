import { Component } from '@angular/core';
import { CenteredBoxComponent } from '@dasch-swiss/vre/ui/ui';
import { ProjectShortDescriptionComponent } from './description/project-short-description.component';

@Component({
  selector: 'app-data-overview',
  template: ` <app-centered-box>
    <app-project-short-description
      class="mat-elevation-z1"
      style="display: block; max-width: 600px; margin-top: 40px" />
  </app-centered-box>`,
  imports: [CenteredBoxComponent, ProjectShortDescriptionComponent],
})
export class DataOverviewComponent {}
