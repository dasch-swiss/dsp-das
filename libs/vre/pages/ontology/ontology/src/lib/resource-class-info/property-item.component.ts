import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { ClassDefinition, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { ProjectsSelectors, PropToDisplay } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-property-item',
  template: ` <div
    cdkDrag
    [cdkDragDisabled]="(isAdmin$ | async) !== true"
    (mouseenter)="isHovered = true"
    (mouseleave)="isHovered = false">
    <mat-list-item class="drag-n-drop-placeholder" *cdkDragPlaceholder></mat-list-item>
    <mat-list-item class="property-item" matRipple #propertyCardRipple="matRipple">
      <div cdkDragHandle matListItemIcon class="list-icon">
        <mat-icon *ngIf="(isAdmin$ | async) === true && isHovered" class="drag-n-drop-handle">drag_indicator </mat-icon>
        <mat-icon
          *ngIf="!isHovered"
          [matTooltip]="propType?.group + ': ' + propType?.label + ' (' + prop.propDef?.id?.split('#')[1] + ')'"
          matTooltipPosition="above"
          >{{ propType?.icon }}
        </mat-icon>
      </div>
      <app-resource-class-property-info
        class="property-info"
        [propDef]="prop?.propDef"
        [propCard]="prop"
        [props]="props"
        [resourceClass]="resourceClass"
        [active]="isHovered" />
    </mat-list-item>
  </div>`,
  styles: [
    `
      .list-icon {
        padding-top: 1rem;
        color: black;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .property-item {
        min-height: 4rem;
        padding-bottom: 1rem;
        align-items: center;
        border-radius: 8px;
        margin-bottom: 0.2rem;
      }

      .property-item:hover {
        background: var(--element-active-hover);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .display-on-hover {
        display: none;
      }

      .drag-n-drop-handle {
        cursor: move;
        color: black;
      }

      .property-info {
        margin-left: 1rem;
        padding: 0;
      }

      .drag-n-drop-placeholder {
        background: #ccc;
        border: dotted 3px #999;
        border-radius: 8px;
        height: 54px;
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyItemComponent implements AfterViewInit {
  @Input() resourceClass: ClassDefinition;
  @Input({ required: true }) prop!: PropToDisplay;
  @Input() props: PropToDisplay[];

  @ViewChild('propertyCardRipple') propertyCardRipple!: MatRipple;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  isHovered = false;

  constructor(
    private _oes: OntologyEditService,
    private _ontoService: OntologyService,
    private _store: Store
  ) {}

  ngAfterViewInit() {
    if (this._oes.latestChangedItem.value === this.prop.propDef?.id) {
      this.propertyCardRipple.launch({
        persistent: false,
      });
      this._oes.latestChangedItem.next(null);
    }
  }

  get propType(): DefaultProperty {
    return this._ontoService.getDefaultPropertyType(this.prop!.propDef as ResourcePropertyDefinitionWithAllLanguages);
  }
}
