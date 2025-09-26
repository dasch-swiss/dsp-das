import { Component, OnInit } from '@angular/core';
import { UserService } from '@dasch-swiss/vre/core/session';
import { of } from 'rxjs';
import { MultipleViewerService } from './comparison/multiple-viewer.service';
import { AbTestService } from './resource-class-sidenav/ab-test.service';
import { ResourceResultService } from './resource-result.service';

@Component({
  selector: 'app-resource-class-browser-page-3',
  template: `<div style="display: flex; flex-direction: column; height: 100%">
    @if (multipleViewerService.selectMode) {
      <app-resource-list-selection />
    }
    <as-split direction="horizontal">
      <as-split-area [size]="25">
        <app-project-sidenav />
      </as-split-area>
      @if (_abtestService.resourceClasSelected) {
        <as-split-area [size]="25" cdkScrollable>
          <app-resources-list-fetcher [ontologyLabel]="'incunabula'" [classLabel]="'Book'" [reload$]="hasRight$" />
        </as-split-area>
        <as-split-area [size]="50">
          <app-multiple-viewer />
        </as-split-area>
      } @else {
        <as-split-area [size]="75">
          <app-centered-box>
            <app-centered-message
              [icon]="'arrow_circle_left'"
              [title]="'Select a resource on the left panel'"
              [message]="
                'Choose one or more resources from the left panel to display and compare them here.'
              " /> </app-centered-box
        ></as-split-area>
      }
    </as-split>
  </div> `,
  providers: [MultipleViewerService, ResourceResultService],
})
export class ResourceClassBrowserPage3Component implements OnInit {
  get data() {
    return { resources: [], selectFirstResource: false };
  }
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
