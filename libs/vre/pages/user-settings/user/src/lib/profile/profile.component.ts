import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UserService } from '@dasch-swiss/vre/core/session';
import { Subject, takeUntil, takeWhile } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  template: `
    <div class="user-profile" *ngIf="user$ | async as user">
      <img appAdminImage [image]="user.email" [type]="'user'" alt="user profile" class="user-profile-image" />
      <div class="user-profile-headline">
        <!-- user names -->
        <h2 class="mat-headline-6">{{ user.givenName }} <br />{{ user.familyName }}</h2>
        <h3 class="mat-body subtitle">{{ user.username }}</h3>

        <mat-divider />

        <ul class="user-profile-info">
          <br />
          <li>
            <mat-icon>language</mat-icon>
            {{ user.lang }}
          </li>
          <li class="status warning text-only" *ngIf="isSysAdmin$ | async">
            <mat-icon>verified_user</mat-icon>
            <span>{{ 'pages.userSettings.profile.systemAdmin' | translate }}</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  isSysAdmin$ = this._userService.isSysAdmin$;
  user$ = this._userService.user$;

  constructor(
    private _userService: UserService,
    private _titleService: Title
  ) {}

  ngOnInit() {
    this.user$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeWhile(user => user !== null)
      )
      .subscribe(user => this._titleService.setTitle(`${user.username} (${user.givenName} ${user.familyName})`));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
