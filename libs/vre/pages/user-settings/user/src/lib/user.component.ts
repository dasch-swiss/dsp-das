import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from './menu-item';

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
        <a mat-tab-link [routerLink]="['account']" routerLinkActive="active-link">
          <mat-icon class="tab-icon">settings</mat-icon>
          Account
        </a>
        <a mat-tab-link [routerLink]="['projects']" routerLinkActive="active-link">
          <mat-icon class="tab-icon">assignments</mat-icon>
          Projects
        </a>
      </nav>

      <mat-tab-nav-panel #tabPanel>
        <router-outlet />
      </mat-tab-nav-panel>
    </app-centered-layout>
  `,
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  navigation: MenuItem[] = [
    {
      label: this._translateService.instant('pages.userSettings.navigation.myAccount'),
      shortLabel: this._translateService.instant('pages.userSettings.navigation.myAccount'),
      route: RouteConstants.userAccountRelative,
      icon: 'settings',
    },
    {
      label: this._translateService.instant('pages.userSettings.navigation.myProjects'),
      shortLabel: this._translateService.instant('pages.userSettings.navigation.myProjects'),
      route: `${RouteConstants.userAccountRelative}/${RouteConstants.projectsRelative}`,
      icon: 'assignment',
    },
  ];

  constructor(private _translateService: TranslateService) {}
}
