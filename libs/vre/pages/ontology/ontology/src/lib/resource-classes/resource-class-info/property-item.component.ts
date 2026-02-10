import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDragHandle, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Cardinality, IHasProperty } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { SplitPipe } from '@dasch-swiss/vre/shared/app-common-to-move';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { EditPropertyFormDialogComponent } from '../../forms/property-form/edit-property-form-dialog.component';
import { EditPropertyDialogData } from '../../forms/property-form/property-form.type';
import { ClassPropertyInfo } from '../../ontology.types';
import { OntologyEditService } from '../../services/ontology-edit.service';
import { CardinalityComponent } from './cardinality-component/cardinality.component';

@Component({
  selector: 'app-property-item',
  template: ` <div
    cdkDrag
    [cdkDragDisabled]="(isAdmin$ | async) !== true"
    (mouseenter)="isHovered = true"
    (mouseleave)="isHovered = false">
    <div class="drag-n-drop-placeholder" *cdkDragPlaceholder></div>

    <div class="property-item" [class.admin]="(isAdmin$ | async) === true">
      <button cdkDragHandle matIconButton class="list-icon">
        @if ((isAdmin$ | async) === true && isHovered) {
          <mat-icon class="drag-n-drop-handle">drag_indicator </mat-icon>
        }
        @if (!isHovered || (isAdmin$ | async) !== true) {
          <mat-icon
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
        }
      </button>

      <div style="flex: 1">
        <div class="upper-prop-container mat-body-medium">
          <span data-cy="property-label">{{ classProp.propDef.labels | appStringifyStringLiteral }} </span>
          @if (classProp.objectLabels && classProp.objectLabels.length > 0) {
            <span
              data-cy="property-object-label"
              class="additional-info"
              [innerHTML]="'&rarr;&nbsp;' + (classProp.objectLabels | appStringifyStringLiteral)"></span>
          }
        </div>
        <div class="lower-prop-container mat-label-small">
          <span> {{ classProp.propDef.id | split: '#' : 1 }} </span>
          @if (isHovered && classProp.propDef.comments?.length) {
            <mat-icon
              class="small-icon"
              [matTooltip]="classProp.propDef.comments | appStringifyStringLiteral"
              matTooltipPosition="above"
              >info</mat-icon
            >
          }
        </div>
      </div>

      <app-cardinality
        [disabled]="(isAdmin$ | async) !== true"
        [isHovered]="isHovered"
        [classProp]="classProp"
        (cardinalityChange)="updateCardinality($event)" />

      @if ((isHovered || menuOpen) && (isAdmin$ | async) === true) {
        <button mat-icon-button>
          <mat-icon
            (menuOpened)="menuOpen = true"
            (menuClosed)="menuOpen = false"
            [matMenuTriggerFor]="classInfoMenu"
            class="menu-icon-button"
            (click)="canBeRemovedFromClass()"
            >more_vert</mat-icon
          >
        </button>
      }
    </div>

    <mat-menu #classInfoMenu="matMenu">
      <button mat-menu-item (click)="openEditProperty()">
        <mat-icon>edit</mat-icon>
        <span>{{ 'pages.ontology.propertyItem.edit' | translate }}</span>
      </button>
      <button mat-menu-item [disabled]="!propCanBeRemovedFromClass" (click)="removePropertyFromClass()">
        <mat-icon>link_off</mat-icon>
        <span>{{ 'pages.ontology.propertyItem.removeFromClass' | translate }}</span>
      </button>
      <button mat-menu-item (click)="copyPropertyId()">
        <mat-icon>content_copy</mat-icon>
        {{ 'pages.ontology.propertyItem.copyId' | translate }}
      </button>
    </mat-menu>
  </div>`,
  styles: [
    `
      .small-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .list-icon {
        display: flex;
        align-items: center;
      }

      .property-item {
        display: flex;
        align-items: center;
        padding: 8px;

        &.admin:hover {
          background: var(--mat-sys-surface-variant);
        }
      }

      .drag-n-drop-handle {
        cursor: move;
        color: var(--primary);
      }

      .upper-prop-container {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }

      .lower-prop-container {
        display: flex;
        align-items: center;
      }

      .drag-n-drop-placeholder {
        border: dotted 3px #999;
        border-radius: 8px;
        height: 54px;
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .menu-icon-button {
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    CardinalityComponent,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    SplitPipe,
    StringifyStringLiteralPipe,
    TranslatePipe,
    MatIconButton,
  ],
})
export class PropertyItemComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) classProp!: ClassPropertyInfo;
  @Output() cardinalityChange = new EventEmitter<IHasProperty>();

  @ViewChild('propertyCardRipple') propertyCardRipple!: MatRipple;

  isAdmin$ = this._projectPageService.hasProjectAdminRights$;

  isHovered = false;
  menuOpen = false;

  propCanBeRemovedFromClass = false;

  private _destroy = new Subject<void>();

  protected readonly _translate = inject(TranslateService);

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _clipboard: Clipboard,
    private readonly _dialog: MatDialog,
    private readonly _notification: NotificationService,
    private readonly _oes: OntologyEditService,
    private readonly _projectPageService: ProjectPageService,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this._oes.latestChangedItem.pipe(takeUntil(this._destroy)).subscribe(item => {
      if (item && item === this.classProp.propDef.id) {
        this.propertyCardRipple?.launch({
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
    this.classProp.iHasProperty.cardinality = newValue;
    this.cardinalityChange.emit(this.classProp.iHasProperty);
  }

  canBeRemovedFromClass(): void {
    this._oes
      .propertyCanBeRemovedFromClass$(this.classProp.iHasProperty, this.classProp.classId)
      .subscribe(canDoRes => {
        this.propCanBeRemovedFromClass = canDoRes.canDo;
        this._cdr.markForCheck();
      });
  }

  removePropertyFromClass(): void {
    this._oes.removePropertyFromClass(this.classProp.iHasProperty, this.classProp.classId);
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
    this._dialog.open<EditPropertyFormDialogComponent, EditPropertyDialogData>(EditPropertyFormDialogComponent, {
      viewContainerRef: this._viewContainerRef,
      ...DspDialogConfig.dialogDrawerConfig(propertyData),
    });
  }

  copyPropertyId() {
    this._clipboard.copy(this.classProp.propDef.id);
    this._notification.openSnackBar(this._translate.instant('pages.ontology.propertyItem.idCopied'));
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
