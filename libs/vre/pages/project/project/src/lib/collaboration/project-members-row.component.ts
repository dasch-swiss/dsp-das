import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-project-members-row',
  template: `
    <div style="display: flex">
      <app-user-description [user]="user" />
      <app-project-members-row-menu [user]="user" />
    </div>
  `,
})
export class ProjectMembersRowComponent {
  @Input({ required: true }) user!: ReadUser;
}
