import { Component } from '@angular/core';
import { AbTestService } from './resource-class-sidenav/ab-test.service';

@Component({
  selector: 'app-resource-class-toggle',
  template: ` @if (abTesting.isFullNavigation) {
      <app-resource-class-browser-page-2 />
    } @else {
      <app-resource-class-browser-page-3 />
    }`,
})
export class ResourceClassToggleComponent {
  constructor(public abTesting: AbTestService) {}
}
