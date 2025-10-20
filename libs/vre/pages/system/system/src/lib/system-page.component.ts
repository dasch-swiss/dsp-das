import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-system-page',
  template: `
    <div class="content large middle">
      @if (isSysAdmin$ | async) {
        <div>
          <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="navigation tab-bar margin-from-top">
            <mat-tab-nav-panel #tabPanel />
            @for (link of links; track link) {
              <a
                mat-tab-link
                [routerLink]="link.url"
                (click)="activeLink = link.name"
                routerLinkActive
                #rla="routerLinkActive"
                [active]="rla.isActive">
                <mat-icon class="tab-icon">{{ link.icon }}</mat-icon>
                {{ link.name | translate }}
              </a>
            }
          </nav>
          <router-outlet />
        </div>
      } @else {
        <div class="content large middle">
          <app-status [status]="403" />
        </div>
      }
    </div>
  `,
  styleUrls: ['./system-page.component.scss'],
  standalone: false,
})
export class SystemPageComponent {
  private readonly _userService = inject(UserService);
  private readonly _titleService = inject(Title);
  private readonly _translateService = inject(TranslateService);

  isSysAdmin$ = this._userService.isSysAdmin$;

  links = [
    { name: 'pages.system.allProjects', url: RouteConstants.systemProjects, icon: 'assignment' },
    { name: 'pages.system.allUsers', url: RouteConstants.systemUsers, icon: 'group' },
  ];

  activeLink = '';

  constructor() {
    this._titleService.setTitle(this._translateService.instant('pages.system.title'));
  }
}
