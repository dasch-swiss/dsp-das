import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar style="background: inherit; height: 56px; justify-content: space-between">
      <span style="display: flex; align-items: center">
        <app-header-logo />
        <h1 style="font-size: 18px">DaSCH Service Platform</h1>
      </span>
      <app-header-search />

      <app-header-right />
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
        border-bottom: 1px solid #ebebeb;
        background-color: #fcfdff;
      }
    `,
  ],
})
export class HeaderComponent {}
