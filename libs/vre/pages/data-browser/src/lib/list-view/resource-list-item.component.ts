import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { map } from 'rxjs';
import { MultipleViewerService } from '../comparison/multiple-viewer.service';

@Component({
  selector: 'app-resource-list-item',
  template: `
    <div
      class="item"
      [ngClass]="{ highlighted: isHighlighted$ | async, search: multipleViewerService.searchKeyword !== undefined }"
      data-cy="resource-list-item"
      (mouseenter)="showCheckbox = true"
      (mouseleave)="showCheckbox = false"
      (click)="multipleViewerService.selectOneResource(resource)">
      <div style="display: flex; align-items: center; min-height: 40px">
        <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <div style="color: black">
            {{ resource.label }}
          </div>
          @if (foundIn.length > 0) {
            <div class="found-in">
              {{ 'pages.dataBrowser.resourceListItem.foundIn' | translate }}{{ foundIn.join(', ') }}
            </div>
          }
        </div>

        @if (showCheckbox || multipleViewerService.selectMode) {
          <mat-checkbox
            [checked]="isSelected$ | async"
            (change)="onCheckboxChanged($event)"
            (click)="$event.stopPropagation()" />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .item {
        padding: 0 16px;
        cursor: pointer;
        &:hover {
          background-color: #ebebeb;
        }
        &.search {
          padding: 8px 16px;
        }
      }
      .highlighted {
        border-left: 2px solid #33678f;
        background-color: #d6e0e8;
      }
      mat-list-item {
        border-bottom: 1px solid #ebebeb;
      }

      .found-in {
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-top: 8px;
        font-size: 12px;
      }
    `,
  ],
  standalone: false,
})
export class ResourceListItemComponent implements OnInit {
  @Input({ required: true }) resource!: ReadResource;

  showCheckbox = false;
  foundIn: string[] = [];

  isHighlighted$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => {
      if (this.multipleViewerService.selectMode) {
        return resources.map(r => r.id).includes(this.resource.id);
      } else {
        return resources.length > 0 && resources[0].id === this.resource.id;
      }
    })
  );

  isSelected$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => resources.map(r => r.id).includes(this.resource.id) && this.multipleViewerService.selectMode)
  );

  constructor(public readonly multipleViewerService: MultipleViewerService) {}

  ngOnInit() {
    if (this.multipleViewerService.searchKeyword) {
      this._searchInResource(this.multipleViewerService.searchKeyword);
    }
  }

  onCheckboxChanged(event: MatCheckboxChange) {
    if (event.checked) {
      this.multipleViewerService.addResources([this.resource]);
    } else {
      this.multipleViewerService.removeResources([this.resource]);
    }
  }

  private _searchInResource(keyword: string) {
    Object.values(this.resource.properties).forEach(values => {
      values.forEach(value => {
        if (
          value.strval &&
          value.strval.toLowerCase().includes(keyword.toLowerCase()) &&
          !this.foundIn.includes(value.propertyLabel!)
        ) {
          this.foundIn.push(value.propertyLabel!);
        }
      });
    });
  }
}
