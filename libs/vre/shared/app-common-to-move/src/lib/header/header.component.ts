import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { GlobalSearchComponent } from './global-search.component';
import { HeaderLogoComponent } from './header-logo.component';
import { HeaderUserActionsComponent } from './header-user-actions.component';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    RouterLink,
    HeaderLogoComponent,
    GlobalSearchComponent,
    HeaderUserActionsComponent,
    MatButton,
  ],
  template: `
    <mat-toolbar style="height: 56px; justify-content: space-between">
      <span style="display: flex; align-items: center">
        <app-header-logo />
        <a matButton="text" class="mat-title-medium" routerLink="/">DaSCH Service Platform</a>
      </span>
      <app-global-search />

      <app-header-user-actions />
    </mat-toolbar>
  `,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
