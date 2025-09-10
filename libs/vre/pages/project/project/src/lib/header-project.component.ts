import { Component } from '@angular/core';

@Component({
  selector: 'app-header-project',
  template: ` <mat-toolbar style="background-color: white">
      <app-header-logo />
      <app-header-right />
    </mat-toolbar>
    <app-header-tabs />`,
})
export class HeaderProjectComponent {}
