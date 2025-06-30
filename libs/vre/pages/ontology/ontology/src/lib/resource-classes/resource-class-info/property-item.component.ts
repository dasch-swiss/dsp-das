import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Cardinality,
  ClassDefinition,
  IHasProperty,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ClassPropToDisplay, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditPropertyFormDialogComponent } from '../../forms/property-form/edit-property-form-dialog.component';
import { PropertyEditData } from '../../forms/property-form/property-form.type';
import { OntologyEditService } from '../../services/ontology-edit.service';

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
          <app-resource-class-property-info [property]="prop" />
          <app-cardinality
            [disabled]="(isAdmin$ | async) !== true"
            [cardinality]="prop.iHasProperty.cardinality"
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
      }

      .property-item {
        height: 3rem;
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
        color: var(--primary);
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
export class PropertyItemComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) resourceClass!: ClassDefinition;
  @Input({ required: true }) prop!: ClassPropToDisplay;
  @Input() props: IHasProperty[] = [];

  @ViewChild('propertyCardRipple') propertyCardRipple!: MatRipple;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  isHovered = false;
  menuOpen = false;

  propCanBeRemovedFromClass = false;

  private _destroy = new Subject<void>();

  get propType(): DefaultProperty {
    return this._ontoService.getDefaultPropertyType(this.prop!.propDef as ResourcePropertyDefinitionWithAllLanguages);
  }

  constructor(
    private _cd: ChangeDetectorRef,
    private _oes: OntologyEditService,
    private _dialog: MatDialog,
    private _ontoService: OntologyService,
    private _store: Store
  ) {}

  ngOnInit() {
    this._oes.latestChangedItem.pipe(takeUntil(this._destroy)).subscribe(item => {
      if (item && item === this.prop.propDef?.id) {
        this.propertyCardRipple.launch({
          persistent: false,
        });
        this._oes.latestChangedItem.next(undefined);
      }
    });
  }

  ngAfterViewInit() {
    if (this._oes.latestChangedItem.value === this.prop.propDef?.id) {
      this.propertyCardRipple.launch({
        persistent: false,
      });
      this._oes.latestChangedItem.next(undefined);
    }
  }

  updateCardinality(newValue: Cardinality) {
    const propertyIdx = this.props.findIndex(p => p.propertyIndex === this.prop.iHasProperty.propertyIndex);
    if (propertyIdx !== -1) {
      this.props[propertyIdx] = this.prop.iHasProperty;
      this.props[propertyIdx].cardinality = newValue;
      this._oes.updatePropertiesOfResourceClass(this.resourceClass.id, this.props);
    }
  }

  canBeRemovedFromClass(): void {
    this._oes.propertyCanBeRemovedFromClass$(this.prop.iHasProperty, this.resourceClass.id).subscribe(canDoRes => {
      this.propCanBeRemovedFromClass = canDoRes.canDo;
      this._cd.markForCheck();
    });
  }

  removePropertyFromClass(): void {
    this._oes.removePropertyFromClass(this.prop.iHasProperty, this.resourceClass.id);
  }

  openEditProperty() {
    const propertyData: PropertyEditData = {
      id: this.prop.propDef.id,
      propType: this.propType,
      name: this.prop.propDef.id?.split('#').pop() || '',
      label: this.prop.propDef.labels,
      comment: this.prop.propDef.comments,
      guiElement: this.prop.propDef.guiElement || this.propType.guiElement,
      guiAttribute: this.prop.propDef.guiAttributes[0],
      objectType: this.prop.propDef.objectType,
    };
    this._dialog.open<EditPropertyFormDialogComponent, PropertyEditData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig(propertyData)
    );
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
