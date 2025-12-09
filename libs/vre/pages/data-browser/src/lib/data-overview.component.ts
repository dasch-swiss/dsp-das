import { Component } from '@angular/core';
import { ProjectShortDescriptionComponent } from '@dasch-swiss/vre/pages/project/project';
import { CenteredBoxComponent } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-data-overview',
  template: ` <app-centered-box>
    <app-project-short-description
      style="display: block; max-width: 600px; border: 1px solid #ebebeb; margin-top: 40px" />
  </app-centered-box>`,
  standalone: true,
  imports: [CenteredBoxComponent, ProjectShortDescriptionComponent],
})
export class DataOverviewComponent {}
