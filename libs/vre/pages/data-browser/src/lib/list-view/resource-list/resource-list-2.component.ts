import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { CheckboxUpdate } from '../list-view.component';
import { ListViewService } from '../list-view.service';

@Component({
  selector: 'app-resource-list-2',
  template: `
    <mat-list>
      <app-resource-list-item *ngFor="let resource of resources" [resource]="resource" />
    </mat-list>
  `,
})
export class ResourceList2Component implements OnChanges {
  @Input() resources: ReadResource[] = [];
  @Input() selectedResourceIdx: number[];
  @Input() withMultipleSelection = false;
  @Output() resourcesSelected = new EventEmitter<FilteredResources>();

  constructor(private _listView: ListViewService) {}

  ngOnChanges(changes: SimpleChanges) {}

  selectResource(status: CheckboxUpdate) {}
}
