import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header-project-tabs',
  template: `
    <nav
      mat-tab-nav-bar
      [tabPanel]="tabPanel"
      mat-stretch-tabs="false"
      mat-align-tabs="start"
      animationDuration="0"
      style="background-color: inherit; padding-left: 16px">
      <a mat-tab-link [routerLink]="['description']" routerLinkActive="active-link">
        <mat-icon class="tab-icon">description</mat-icon>
        Description
      </a>
      <a mat-tab-link [routerLink]="['data-models']" routerLinkActive="active-link">
        <mat-icon class="tab-icon">lan</mat-icon>
        Data models
      </a>
      <a mat-tab-link [routerLink]="['data']" [class.active-link]="isDataRouteActive()">
        <mat-icon class="tab-icon">list</mat-icon>
        Data
      </a>
      <a mat-tab-link [routerLink]="['advanced-search']" routerLinkActive="active-link">
        <mat-icon class="tab-icon">search</mat-icon>
        Search
      </a>
      <a mat-tab-link [routerLink]="['settings']" routerLinkActive="active-link">
        <mat-icon class="tab-icon">settings</mat-icon>
        Settings
      </a>
    </nav>
    <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
  `,
  styles: [
    `
      .tab-icon {
        margin-right: 8px;
      }
      .active-link {
        color: var(--mat-tab-header-active-label-text-color) !important;
        border-bottom: 2px solid var(--mat-tab-header-active-ripple-color);
        font-weight: bold;
      }

      :host ::ng-deep .mat-mdc-tab-link {
        padding-left: 16px;
        padding-right: 16px;
      }
    `,
  ],
})
export class HeaderProjectTabsComponent {
  constructor(private _route: ActivatedRoute) {}
  isDataRouteActive(): boolean {
    return ['ontology', 'data'].includes(this._route.snapshot.children[0].url[0].path);
  }
}
