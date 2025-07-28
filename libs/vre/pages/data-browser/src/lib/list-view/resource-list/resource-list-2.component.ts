import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { CheckboxUpdate } from '../list-view.component';
import { ListViewService } from '../list-view.service';

@Component({
  selector: 'app-resource-list-2',
  template: `
    <mat-selection-list>
      <app-resource-list-item *ngFor="let resource of resources" [resource]="resource" />
    </mat-selection-list>
  `,
})
export class ResourceList2Component implements OnChanges {
  @Input({ required: true }) resources: ReadResource[] = [];

  constructor(private _listView: ListViewService) {}

  ngOnChanges(changes: SimpleChanges) {}

  selectResource(status: CheckboxUpdate) {}
}
