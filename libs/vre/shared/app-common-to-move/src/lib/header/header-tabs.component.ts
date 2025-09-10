import { Component } from '@angular/core';

@Component({
  selector: 'app-header-tabs',
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a mat-tab-link [active]="true">Test </a>
    </nav>
    <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>

    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start" animationDuration="0">
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">description</mat-icon>
          Description
        </ng-template>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">bubble_chart</mat-icon>
          Data model
        </ng-template>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">list</mat-icon>
          Data
        </ng-template>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">search</mat-icon>
          Search
        </ng-template>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">settings</mat-icon>
          Settings
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [
    `
      .tab-icon {
        margin-right: 8px;
      }
    `,
  ],
})
export class HeaderTabsComponent {}
