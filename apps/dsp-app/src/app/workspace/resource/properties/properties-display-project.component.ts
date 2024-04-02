import { Component } from '@angular/core';

@Component({
  selector: 'app-properties-display-project',
  template: ` <div class="infobar mat-caption" *ngIf="project">
    <span *ngIf="displayProjectInfo"
      >This resource {{ resource.res.isDeleted ? 'belonged' : 'belongs' }} to the project
      <span class="project link" (click)="openProject(project)" (mouseover)="previewProject()">
        <strong>{{ project?.shortname }}</strong>
        <mat-icon inline>open_in_new</mat-icon>
      </span>
    </span>
    <span class="fill-remaining-space desktop-only"></span>
    <span *ngIf="user || resource.res.creationDate">
      Created
      <span *ngIf="user">by {{ user.username ? user.username : user.givenName + ' ' + user.familyName }}</span>
      <span *ngIf="resource.res.creationDate"> on {{ resource.res.creationDate | date }}</span>
    </span>
  </div>`,
})
export class PropertiesDisplayProjectComponent {}
