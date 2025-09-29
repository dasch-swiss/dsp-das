import { Component, OnInit } from '@angular/core';
import { UserService } from '@dasch-swiss/vre/core/session';
import { MultipleViewerService } from './comparison/multiple-viewer.service';

@Component({
  selector: 'app-resource-class-browser-page-2',
  template: `<div style="display: flex; flex-direction: column; height: 100%">
    @if (multipleViewerService.selectMode) {
      <app-resource-list-selection />
    }
    <as-split direction="horizontal">
      <as-split-area [size]="30">
        <app-project-sidenav />
      </as-split-area>
      <as-split-area [size]="70" cdkScrollable>
        <app-multiple-viewer />
      </as-split-area>
    </as-split>
  </div> `,
  providers: [MultipleViewerService],
  standalone: false,
})
export class ResourceClassBrowserPage2Component implements OnInit {
  constructor(
    public multipleViewerService: MultipleViewerService,
    private _userService: UserService
  ) {}
  ngOnInit() {
    this.multipleViewerService.onInit(this._userService.isSysAdmin$);
  }
}
