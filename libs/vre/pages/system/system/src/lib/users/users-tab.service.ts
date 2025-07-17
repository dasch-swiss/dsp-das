import { Injectable } from '@angular/core';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { BehaviorSubject, map, shareReplay, switchMap, tap } from 'rxjs';

@Injectable()
export class UsersTabService {
  isLoading = true;
  private _refreshSubject = new BehaviorSubject<null>(null);

  allUsers$ = this._refreshSubject.pipe(
    switchMap(() => this._userApiService.list()),
    map(response => response.users),
    tap(() => {
      this.isLoading = false;
    }),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );

  constructor(private _userApiService: UserApiService) {}

  reloadUsers() {
    this._refreshSubject.next(null);
  }
}
