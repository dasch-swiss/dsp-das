import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { ProjectMembersService } from './project-members.service';

@Component({
  selector: 'app-project-members',
  template: ` <app-project-members-row [user]="user" *ngFor="let user of users" />`,
  providers: [ProjectMembersService],
})
export class ProjectMembersComponent {
  @Input({ required: true }) users!: ReadUser[];
}
