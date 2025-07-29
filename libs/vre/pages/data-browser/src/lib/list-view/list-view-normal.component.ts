import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from '../multiple-viewer.service';

@Component({
  selector: 'app-list-view-normal',
  template: ` <app-pager (pageIndexChanged)="doSearch($event)" [numberOfAllResults]="200" />
    <app-resource-list-selection *ngIf="multipleViewerService.selectMode" [resources]="resources" />
    <app-resource-list-2 [resources]="resources" />`,
})
export class ListViewNormalComponent {
  @Input({ required: true }) resources!: ReadResource[];

  constructor(public multipleViewerService: MultipleViewerService) {}

  doSearch(index: number) {}
}
