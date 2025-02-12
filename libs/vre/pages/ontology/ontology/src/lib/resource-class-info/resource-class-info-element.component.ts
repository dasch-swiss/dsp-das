import { Component, Input } from '@angular/core';
import { ClassDefinition } from '@dasch-swiss/dsp-js';
import { ProjectsSelectors, PropToDisplay } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-resource-class-info-element',
  template: ` <div cdkDrag [cdkDragDisabled]="(isAdmin$ | async) !== true">
    <div class="drag-n-drop-placeholder" *cdkDragPlaceholder></div>
    <mat-list-item class="property">
      <span cdkDragHandle matListItemIcon class="list-icon gui-order">
        <span [class.hide-on-hover]="(isAdmin$ | async) === true"> {{ i + 1 }}) </span>
        <span *ngIf="(isAdmin$ | async) === true" class="display-on-hover drag-n-drop-handle">
          <mat-icon>drag_indicator</mat-icon>
        </span>
      </span>
      <!-- display only properties if they exist in list of properties;
                                                                                                                                                                                                                                                       objectType is not a linkValue (otherwise we have the property twice) -->
      <span matListItemTitle>
        <app-resource-class-property-info
          class="property-info"
          [propDef]="prop?.propDef"
          [propCard]="prop"
          [props]="props"
          [resourceClass]="resourceClass" />
      </span>
    </mat-list-item>
  </div>`,
  styles: [
    `
      :host:hover {
        .hide-on-hover {
          display: none;
        }

        .display-on-hover {
          display: block;
        }
      }

      .display-on-hover {
        display: none;
      }

      .drag-n-drop-handle {
        cursor: move;
        color: black;
      }

      .cdk-drag-handle {
        margin-right: 8px !important;
      }

      .hide-on-hover {
        color: black;
        font-size: 14pt;
      }
    `,
  ],
})
export class ResourceClassInfoElementComponent {
  @Input() resourceClass: ClassDefinition;
  @Input() prop: PropToDisplay;
  @Input() props: PropToDisplay[];
  @Input() i: number; // index

  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isAdmin$!: Observable<boolean>;

  constructor(protected ps: ProjectService) {}
}
