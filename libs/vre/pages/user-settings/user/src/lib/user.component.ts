import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsComponent } from '@dasch-swiss/vre/pages/system/system';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AccountComponent } from './account/account.component';
import { MenuItem } from './menu-item';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CenteredLayoutComponent,
    ProfileComponent,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    MatTabNavPanel,
    ProjectsComponent,
    AccountComponent,
  ],
})
export class UserComponent {
  route: string;

  // for the sidenav
  open = true;

  navigation: MenuItem[] = [
    {
      label: this._translateService.instant('pages.userSettings.navigation.myProjects'),
      shortLabel: this._translateService.instant('pages.userSettings.navigation.myProjects'),
      route: RouteConstants.projectsRelative,
      icon: 'assignment',
    },
    {
      label: this._translateService.instant('pages.userSettings.navigation.myAccount'),
      shortLabel: this._translateService.instant('pages.userSettings.navigation.myAccount'),
      route: RouteConstants.userAccountRelative,
      icon: 'settings',
    },
  ];

  routeConstants = RouteConstants;

  constructor(
    private _route: ActivatedRoute,
    private _translateService: TranslateService
  ) {
    // get the activated route; we need it for the viewer switch
    this.route = this._route.pathFromRoot[1].snapshot.url[0].path;
  }
}
