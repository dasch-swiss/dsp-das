import { Component, Input } from '@angular/core';
import { UserDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ProjectMembersService } from './project-members.service';

@Component({
  selector: 'app-project-members',
  template: ` <app-project-members-row [user]="user" *ngFor="let user of users" />`,
  providers: [ProjectMembersService],
})
export class ProjectMembersComponent {
  @Input({ required: true }) users!: UserDto[];
}
