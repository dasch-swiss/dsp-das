import { Component, OnInit } from '@angular/core';
import { UserService } from '@dasch-swiss/vre/core/session';
import { MultipleViewerService } from './comparison/multiple-viewer.service';

@Component({
  selector: 'app-resource-class-browser-page-2',
  template: `<div style="display: flex; flex-direction: column; height: 100%">
    @if (multipleViewerService.selectMode) {
      <app-resource-list-selection />
    }
    <div style="display: flex; height: 100%">
      <app-project-sidenav />
      <div style="flex: 1; display: flex; justify-content: center">
        <app-multiple-viewer style="flex: 1" />
      </div>
    </div>
  </div> `,
  providers: [MultipleViewerService],
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
