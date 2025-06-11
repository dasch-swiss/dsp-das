import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { Cardinality, ClassDefinition, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
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
          <mat-icon *ngIf="(isAdmin$ | async) === true && isHovered" class="drag-n-drop-handle"
            >drag_indicator
          </mat-icon>
          <mat-icon
            *ngIf="!isHovered || (isAdmin$ | async) !== true"
            [matTooltip]="propType?.group + ': ' + propType?.label + ' (' + prop.propDef?.id?.split('#')[1] + ')'"
            matTooltipPosition="above"
            >{{ propType?.icon }}
          </mat-icon>
        </div>
        <div class="property-item-content-container">
          <app-resource-class-property-info [propDef]="prop?.propDef" />
          <app-cardinality
            [disabled]="(isAdmin$ | async) !== true"
            [cardinality]="prop.cardinality"
            [classIri]="resourceClass.id"
            [propertyInfo]="{ propDef: this.prop.propDef, propType: this.propType }"
            (cardinalityChange)="updateCardinality($event)" />
        </div>
        <div class="edit-menu">
          <mat-icon
            *ngIf="(isHovered || menuOpen) && (isAdmin$ | async) === true"
            (menuOpened)="menuOpen = true"
            (menuClosed)="menuOpen = false"
            [matMenuTriggerFor]="classInfoMenu"
            class="menu-icon-button"
            (click)="canBeRemovedFromClass()"
            >more_vert</mat-icon
          >
        </div>
      </mat-list-item>
    </div>
    <mat-menu #classInfoMenu="matMenu">
      <div class="remove-menu-wrapper">
        <button mat-menu-item [disabled]="!propCanBeRemovedFromClass" (click)="removePropertyFromClass()">
          <mat-icon>link_off</mat-icon>
          <span>remove property from class</span>
        </button>
        <button mat-menu-item (click)="openEditProperty()">
          <mat-icon>edit</mat-icon>
          <span>Edit property</span>
        </button>
      </div>
    </mat-menu>`,
  styles: [
    `
      .list-icon {
        color: black;
        display: flex;
        align-items: center;
        height: 100%;
      }

      .property-item {
        min-height: 4rem;
        align-items: center;
        border-radius: 8px;
        margin: 0;
      }

      .property-item:hover {
        background: var(--element-active-hover);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .drag-n-drop-handle {
        cursor: move;
        color: black;
      }

      .property-item-content-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-right: 0.5rem;
      }

      .drag-n-drop-placeholder {
        border: dotted 3px #999;
        border-radius: 8px;
        height: 54px;
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .edit-menu {
        position: absolute;
        top: 0.2rem;
        right: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }

      .menu-icon-button {
        font-size: medium;
        cursor: pointer;
      }

      .remove-menu-wrapper {
        min-width: 18em;
        width: 18em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyItemComponent implements AfterViewInit {
  @Input({ required: true }) resourceClass: ClassDefinition;
  @Input({ required: true }) prop!: PropToDisplay;
  @Input() props: PropToDisplay[] = [];

  @ViewChild('propertyCardRipple') propertyCardRipple!: MatRipple;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  isHovered = false;
  menuOpen = false;

  propCanBeRemovedFromClass = false;

  get propType(): DefaultProperty {
    return this._ontoService.getDefaultPropertyType(this.prop!.propDef as ResourcePropertyDefinitionWithAllLanguages);
  }

  constructor(
    private _cd: ChangeDetectorRef,
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

  updateCardinality(newValue: Cardinality) {
    const propertyIdx = this.props.findIndex(p => p.propertyIndex === this.prop.propertyIndex);
    if (propertyIdx !== -1) {
      this.props[propertyIdx] = this.prop;
      this.props[propertyIdx].cardinality = newValue;
      this._oes.updateCardinalitiesOfResourceClass(this.resourceClass.id, this.props);
    }
  }

  canBeRemovedFromClass(): void {
    this._oes.propertyCanBeRemovedFromClass(this.prop, this.resourceClass.id).subscribe(canDoRes => {
      this.propCanBeRemovedFromClass = canDoRes.canDo;
      this._cd.markForCheck();
    });
  }

  removePropertyFromClass(): void {
    this._oes.removePropertyFromClass(this.prop, this.resourceClass.id);
  }

  openEditProperty() {
    this._oes.openEditProperty(this.prop.propDef, this.propType);
  }
}
