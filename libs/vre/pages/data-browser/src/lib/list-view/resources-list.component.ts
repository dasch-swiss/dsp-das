import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from '../comparison/multiple-viewer.service';
import { ResourceResultService } from '../resource-result.service';

@Component({
  selector: 'app-resources-list',
  template: `<div style="padding: 16px; display: flex; flex-direction: row-reverse">
      <a mat-stroked-button [routerLink]="['..', '..']"><mat-icon>chevron_left</mat-icon>Back to search form</a>
    </div>
    <app-pager
      (pageIndexChanged)="updatePageIndex($event)"
      [numberOfAllResults]="resourceResultService.numberOfResults" />
    <app-resource-list-selection *ngIf="multipleViewerService.selectMode" [resources]="resources" />
    <app-resource-list [resources]="resources" />`,
})
export class ResourcesListComponent {
  @Input({ required: true }) resources!: ReadResource[];

  constructor(
    public multipleViewerService: MultipleViewerService,
    public resourceResultService: ResourceResultService
  ) {}

  updatePageIndex(index: number) {
    this.resourceResultService.updatePageIndex(index);
  }
}
