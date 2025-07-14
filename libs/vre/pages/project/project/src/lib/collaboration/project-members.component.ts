import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-project-members',
  template: ` <app-project-members-row [user]="user" *ngFor="let user of users" />
    <span *ngIf="users.length === 0">There are no users.</span>`,
})
export class ProjectMembersComponent {
  @Input({ required: true }) users!: ReadUser[];
}
