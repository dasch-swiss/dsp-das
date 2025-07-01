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
import { Cardinality } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditPropertyFormDialogComponent } from '../../forms/property-form/edit-property-form-dialog.component';
import { EditPropertyDialogData } from '../../forms/property-form/property-form.type';
import { ClassPropertyInfo, ResourceClassInfo } from '../../ontology.types';
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
            [matTooltip]="
              classProp.propType?.group +
              ': ' +
              classProp.propType?.label +
              ' (' +
              classProp.propDef?.id?.split('#')[1] +
              ')'
            "
            matTooltipPosition="above"
            >{{ classProp.propType?.icon }}
          </mat-icon>
        </div>
        <div class="property-item-content-container">
          <div>
            <div class="upper-prop-container">
              <span class="label" data-cy="property-labels">{{ classProp.propDef.label }} </span>
              <span
                class="additional-info"
                *ngIf="classProp.objectLabel"
                [innerHTML]="'&rarr;&nbsp;' + classProp.objectLabel"></span>
            </div>
            <div mat-line class="lower-prop-container">
              <span class="mat-caption"> {{ classProp.propDef.id | split: '#' : 1 }} </span>
            </div>
          </div>
          <app-cardinality
            [disabled]="(isAdmin$ | async) !== true"
            [classProp]="classProp"
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
      @use '../../../../../../../../../apps/dsp-app/src/styles/config' as *;

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

      .upper-prop-container {
        margin-top: 12px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }

      .lower-prop-container {
        color: $primary_700;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
  @Input({ required: true }) classProp!: ClassPropertyInfo;

  @ViewChild('propertyCardRipple') propertyCardRipple!: MatRipple;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  isHovered = false;
  menuOpen = false;

  propCanBeRemovedFromClass = false;

  private _destroy = new Subject<void>();

  constructor(
    private _cd: ChangeDetectorRef,
    private _oes: OntologyEditService,
    private _dialog: MatDialog,
    private _store: Store
  ) {}

  ngOnInit() {
    this._oes.latestChangedItem.pipe(takeUntil(this._destroy)).subscribe(item => {
      if (item && item === this.classProp.propDef.id) {
        this.propertyCardRipple.launch({
          persistent: false,
        });
        this._oes.latestChangedItem.next(undefined);
      }
    });
  }

  ngAfterViewInit() {
    if (this._oes.latestChangedItem.value === this.classProp.propDef.id) {
      this.propertyCardRipple.launch({
        persistent: false,
      });
      this._oes.latestChangedItem.next(undefined);
    }
  }

  updateCardinality(newValue: Cardinality) {
    const propertyIdx = this.classProp.classDefinition.propertiesList.findIndex(
      p => p.propertyIndex === this.classProp.iHasProperty.propertyIndex
    );
    if (propertyIdx !== -1) {
      this.classProp.classDefinition.propertiesList[propertyIdx].cardinality = newValue;
      this._oes.updatePropertiesOfResourceClass(
        this.classProp.classDefinition.id,
        this.classProp.classDefinition.propertiesList
      );
    }
  }

  canBeRemovedFromClass(): void {
    this._oes
      .propertyCanBeRemovedFromClass$(this.classProp.iHasProperty, this.classProp.classDefinition.id)
      .subscribe(canDoRes => {
        this.propCanBeRemovedFromClass = canDoRes.canDo;
        this._cd.markForCheck();
      });
  }

  removePropertyFromClass(): void {
    this._oes.removePropertyFromClass(this.classProp.iHasProperty, this.classProp.classDefinition.id);
  }

  openEditProperty() {
    const propertyData: EditPropertyDialogData = {
      id: this.classProp.propDef.id,
      propType: this.classProp.propType,
      name: this.classProp.propDef.id?.split('#').pop() || '',
      label: this.classProp.propDef.labels,
      comment: this.classProp.propDef.comments,
      guiElement: this.classProp.propDef.guiElement || this.classProp.propType.guiElement,
      guiAttribute: this.classProp.propDef.guiAttributes[0],
      objectType: this.classProp.propDef.objectType,
    };
    this._dialog.open<EditPropertyFormDialogComponent, EditPropertyDialogData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig(propertyData)
    );
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
