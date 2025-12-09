import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CenteredBoxComponent } from '@dasch-swiss/vre/ui/centered-box';
import { CenteredMessageComponent } from '@dasch-swiss/vre/ui/centered-message';
import { map } from 'rxjs';
import { ResourceListSelectionComponent } from '../list-view/resource-list-selection.component';
import { ComparisonComponent } from './comparison.component';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer',
  template: `
    @if (selectedResourceIds$ | async; as selectedResourceIds) {
      @if (selectedResourceIds.length === 0) {
        <app-centered-box>
          <app-centered-message
            [icon]="'arrow_circle_left'"
            [title]="'pages.dataBrowser.multipleViewer.selectResource' | translate"
            [message]="'pages.dataBrowser.multipleViewer.chooseResources' | translate" />
        </app-centered-box>
      } @else {
        @if (multipleViewerService.selectMode) {
          <app-resource-list-selection />
        }
        @if (selectedResourceIds.length <= MAX_RESOURCES) {
          <app-comparison [resourceIds]="selectedResourceIds" />
        } @else {
          <app-centered-box>
            <app-centered-message
              [icon]="'warning'"
              [title]="'pages.dataBrowser.multipleViewer.tooManyResources' | translate"
              [message]="'pages.dataBrowser.multipleViewer.maxResources' | translate: { count: MAX_RESOURCES }" />
          </app-centered-box>
        }
      }
    }
  `,
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    CenteredBoxComponent,
    CenteredMessageComponent,
    ResourceListSelectionComponent,
    ComparisonComponent,
  ],
})
export class MultipleViewerComponent {
  readonly MAX_RESOURCES = 6;

  selectedResourceIds$ = this.multipleViewerService.selectedResources$.pipe(map(resources => resources.map(r => r.id)));

  constructor(public readonly multipleViewerService: MultipleViewerService) {}
}
