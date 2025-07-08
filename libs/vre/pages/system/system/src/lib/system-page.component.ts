import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-system',
  templateUrl: './system-page.component.html',
  styleUrls: ['./system-page.component.scss'],
})
export class SystemPageComponent {
  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);

  links = [
    { name: 'All Projects', url: RouteConstants.systemProjects, icon: 'assignment' },
    { name: 'All Users', url: RouteConstants.systemUsers, icon: 'group' },
  ];

  activeLink = '';

  constructor(
    private readonly _store: Store,
    private readonly _titleService: Title
  ) {
    this._titleService.setTitle('System administration');
  }
}
