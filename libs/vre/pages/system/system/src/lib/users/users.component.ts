import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { LoadUsersAction, UserSelectors } from '@dasch-swiss/vre/core/state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @Select(UserSelectors.usersLoading) isLoading$: Observable<boolean>;
  @Select(UserSelectors.activeUsers) active$: Observable<ReadUser[]>;
  @Select(UserSelectors.inactiveUsers) inactive$: Observable<ReadUser[]>;

  constructor(
    private _titleService: Title,
    private _store: Store
  ) {
    this._titleService.setTitle('All users in DSP');
  }

  ngOnInit() {
    this._store.dispatch(new LoadUsersAction());
  }
}
