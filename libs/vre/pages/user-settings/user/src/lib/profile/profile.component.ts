import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UserService } from '@dasch-swiss/vre/core/session';
import { Subject, takeUntil, takeWhile } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  template: `
    <div *ngIf="user$ | async as user" style="display: flex; flex-direction: column; gap: 24px; padding: 24px; max-width: 600px;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img appAdminImage [image]="user.email" [type]="'user'" alt="user profile" 
             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <h1 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1a1a1a;">
            {{ user.givenName }} {{ user.familyName }}
          </h1>
          <p style="margin: 0; color: #666; font-size: 1rem;">{{ user.username }}</p>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <mat-icon style="color: #666; font-size: 20px;">language</mat-icon>
          <span style="font-size: 1rem; color: #333;">{{ user.lang }}</span>
        </div>
        <div *ngIf="isSysAdmin$ | async" 
             style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <mat-icon style="color: #856404; font-size: 20px;">verified_user</mat-icon>
          <span style="color: #856404; font-weight: 500;">{{ 'pages.userSettings.profile.systemAdmin' | translate }}</span>
        </div>
      </div>
    </div>
  `,
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
