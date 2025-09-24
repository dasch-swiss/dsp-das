import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
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
