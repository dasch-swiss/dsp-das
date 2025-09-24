import { Component } from '@angular/core';

@Component({
  selector: 'app-global-page',
  template: ` <app-header /> <router-outlet />`,
})
export class GlobalPageComponent {}
