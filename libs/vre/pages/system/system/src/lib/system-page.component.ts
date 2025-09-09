import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTabNav, MatTabNavPanel, MatTabLink } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { StatusComponent } from '@dasch-swiss/vre/shared/app-common-to-move';

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
                {{ link.name }}
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
  standalone: true,
  imports: [
    MatTabNav,
    MatTabNavPanel,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    RouterOutlet,
    StatusComponent,
    AsyncPipe,
  ],
})
export class SystemPageComponent {
  isSysAdmin$ = this._userService.isSysAdmin$;

  links = [
    { name: 'All Projects', url: RouteConstants.systemProjects, icon: 'assignment' },
    { name: 'All Users', url: RouteConstants.systemUsers, icon: 'group' },
  ];

  activeLink = '';

  constructor(
    private readonly _userService: UserService,
    private readonly _titleService: Title
  ) {
    this._titleService.setTitle('System administration');
  }
}
