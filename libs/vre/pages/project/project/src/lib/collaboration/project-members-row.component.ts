import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-project-members-row',
  template: ` <app-user-description [user]="user" />`,
})
export class ProjectMembersRowComponent {
  @Input({ required: true }) user!: ReadUser;
}
