import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChildren } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { Constants, ReadResource } from '@dasch-swiss/dsp-js';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { CheckboxUpdate } from '../list-view.component';
import { ListViewService } from '../list-view.service';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss'],
})
export class ResourceListComponent implements OnChanges {
  /**
   * list of all resource checkboxes. This list is used to
   * unselect all checkboxes when single selection to view
   * resource is used
   */
  @ViewChildren('ckbox') resChecks: MatCheckbox[];

  /**
   * list of resources of type ReadResource
   *
   * @param  {ReadResource[]} resources
   */
  @Input() resources: ReadResource[] = [];

  /**
   * list of all selected resources indices
   */
  @Input() selectedResourceIdx: number[];

  /**
   * set to true if multiple resources can be selected for comparison
   */
  @Input() withMultipleSelection?: boolean = false;

  /**
   * click on checkbox will emit the resource info
   *
   * @param  {EventEmitter<FilteredResources>} resourcesSelected
   */
  @Output() resourcesSelected?: EventEmitter<FilteredResources> = new EventEmitter<FilteredResources>();

  constructor(private _listView: ListViewService) {}

  ngOnChanges(changes: SimpleChanges) {
    // select the first item in the list
    if (changes['resources'] && this.resources.length) {
      this.selectResource({
        checked: true,
        resIndex: 0,
        resId: this.resources[0].id,
        resLabel: this.resources[0].label,
        isCheckbox: false,
      });
    }
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

  /**
   * given a resource, return the corresponding mat-icon for the subclass
   *
   * @returns mat-icon name as string
   */
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
