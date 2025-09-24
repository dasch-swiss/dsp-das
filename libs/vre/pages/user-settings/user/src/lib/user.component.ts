import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <app-centered-layout>
      <app-profile />

      <nav
        mat-tab-nav-bar
        mat-stretch-tabs="false"
        mat-align-tabs="start"
        animationDuration="0ms"
        [tabPanel]="tabPanel">
        <a
          mat-tab-link
          [routerLink]="['account']"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon class="tab-icon">settings</mat-icon>
          {{ 'pages.userSettings.navigation.myAccount' | translate }}
        </a>
        <a
          mat-tab-link
          [routerLink]="['projects']"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon class="tab-icon">assignments</mat-icon>
          {{ 'pages.userSettings.navigation.myProjects' | translate }}
        </a>
      </nav>

      <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
      <router-outlet></router-outlet>
    </app-centered-layout>
  `,
})
export class UserComponent {}
