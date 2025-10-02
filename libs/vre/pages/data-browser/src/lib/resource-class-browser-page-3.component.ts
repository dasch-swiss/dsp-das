import { Component, OnInit } from '@angular/core';
import { UserService } from '@dasch-swiss/vre/core/session';
import { of } from 'rxjs';
import { MultipleViewerService } from './comparison/multiple-viewer.service';
import { AbTestService } from './resource-class-sidenav/ab-test.service';
import { ResourceResultService } from './resource-result.service';

@Component({
  selector: 'app-resource-class-browser-page-3',
  template: `<div style="display: flex; flex-direction: column; height: 100%">
    <as-split direction="horizontal">
      <as-split-area [size]="20">
        <app-project-sidenav />
      </as-split-area>
      @if (_abtestService.resourceClasSelected; as classSelected) {
        <as-split-area [size]="20" cdkScrollable>
          <app-resource-class-panel [classSelected]="classSelected" />
        </as-split-area>
        <as-split-area [size]="60">
          @if (multipleViewerService.selectMode) {
            <app-resource-list-selection />
          }
          <app-multiple-viewer />
        </as-split-area>
      } @else {
        <as-split-area [size]="80">
          <app-centered-box>
            <app-project-short-description
              style="display: block; max-width: 600px; border: 1px solid #ebebeb; margin-top: 40px" /> </app-centered-box
        ></as-split-area>
      }
    </as-split>
  </div> `,
  providers: [MultipleViewerService, ResourceResultService, AbTestService],
  standalone: false,
})
export class ResourceClassBrowserPage3Component implements OnInit {
  hasRight$ = of(true);
  constructor(
    public multipleViewerService: MultipleViewerService,
    private _userService: UserService,
    public _abtestService: AbTestService
  ) {}
  ngOnInit() {
    this.multipleViewerService.onInit(this._userService.isSysAdmin$);
  }
}
