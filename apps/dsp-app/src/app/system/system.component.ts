import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Select } from '@ngxs/store';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable } from 'rxjs';
import { MenuItem } from '../main/declarations/menu-item';
import { AppGlobal } from '../app-global';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent {
  loading = true;

  navigation: MenuItem[] = AppGlobal.systemNav;

  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;

  constructor(private _titleService: Title) {
    // set the page title
    this._titleService.setTitle('System administration');
  }
}
