import { Component, EventEmitter, Input, OnInit, Output, ViewChildren } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { Constants, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { CheckboxUpdate } from '../list-view.component';
import { ListViewService } from '../list-view.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss'],
})
export class ResourceListComponent implements OnInit {
  @Input({ required: true }) resources!: ReadResourceSequence;
  @Input({ required: true }) selectedResourceIdx!: number[];
  @Input({ required: true }) withMultipleSelection!: boolean;
  @Output() resourcesSelected = new EventEmitter<FilteredResources>();
  @ViewChildren('ckbox') resChecks!: MatCheckbox[];

  constructor(
    private _listView: ListViewService,
    private _resourceService: ResourceService
  ) {}

  ngOnInit() {
    if (this.resources.resources.length) {
      this.selectResource({
        checked: true,
        resIndex: 0,
        resId: this.resources.resources[0].id,
        resLabel: this.resources.resources[0].label,
        isCheckbox: false,
      });
    }
  }

  openResource(linkValue: string) {
    const path = this._resourceService.getResourcePath(linkValue);
    window.open(`/resource${path}`, '_blank');
  }

  selectResource(status: CheckboxUpdate) {
    const selection: FilteredResources = this._listView.viewResource(
      status,
      this.withMultipleSelection,
      this.selectedResourceIdx,
      this.resChecks
    );

    this.selectedResourceIdx = selection.resListIndex;
    this.resourcesSelected.emit(selection);
  }

  getIcon(resource: ReadResource): string {
    const subclass = resource.entityInfo.classes[resource.type].subClassOf[0];

    switch (subclass) {
      case Constants.AudioRepresentation:
        return 'audio_file';
      case Constants.ArchiveRepresentation:
        return 'folder_zip';
      case Constants.DocumentRepresentation:
        return 'description';
      case Constants.MovingImageRepresentation:
        return 'video_file';
      case Constants.StillImageRepresentation:
        return 'image';
      case Constants.TextRepresentation:
        return 'text_snippet';
      default: // resource does not have a file representation
        return 'insert_drive_file';
    }
  }
}
