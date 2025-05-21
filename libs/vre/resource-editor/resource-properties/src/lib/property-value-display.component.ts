import { Component, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { DeleteValueDialogComponent, DeleteValueDialogProps } from './delete-value-dialog.component';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value-display',
  template: ` <app-property-value-switcher-2
      [myProperty]="propertyValueService.propertyDefinition"
      [editMode]="false"
      (templateFound)="itemTpl = $event" />
    <div
      data-cy="property-value"
      class="pos-relative row"
      (mouseenter)="showBubble = true"
      (mouseleave)="showBubble = false">
      <app-property-value-action-bubble
        *ngIf="
          !propertyValueService.keepEditMode && showBubble && (propertyValueService.lastOpenedItem$ | async) !== index
        "
        [date]="propertyValueService.editModeData?.values[index]?.valueCreationDate"
        [showDelete]="index > 0 || [Cardinality._0_1, Cardinality._0_n].includes(propertyValueService.cardinality)"
        (editAction)="propertyValueService.toggleOpenedValue(index)"
        (deleteAction)="askToDelete()" />

      <div class="value" [ngClass]="{ highlighted: isHighlighted }">
        <ng-container *ngIf="itemTpl">
          <ng-container
            *ngTemplateOutlet="itemTpl; context: { item: group?.controls.item, displayMode: true }"></ng-container>
        </ng-container>

        <app-property-value-comment [displayMode]="true" [control]="group?.controls.comment" />
      </div>
    </div>`,
  styleUrls: ['./property-value-display.component.scss'],
})
export class PropertyValueDisplayComponent implements OnInit {
  @Input({ required: true }) index!: number;

  get group() {
    return this.propertyValueService.formArray.at(this.index);
  }

  itemTpl?: TemplateRef<any>;
  isHighlighted!: boolean;
  showBubble = false;

  constructor(
    public propertyValueService: PropertyValueService,
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    private _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._highlightArkValue();
    this.propertyValueService.lastOpenedItem$.subscribe(v => {
      console.log('got last opened value:', v, this.index);
    });
  }

  protected readonly Cardinality = Cardinality;

  askToDelete() {
    this._dialog.open<DeleteValueDialogComponent, DeleteValueDialogProps>(DeleteValueDialogComponent, {
      data: { index: this.index },
      viewContainerRef: this._viewContainerRef,
    });
  }

  private _highlightArkValue() {
    this.isHighlighted =
      this._route.snapshot.queryParams['highlightValue'] ===
      this.propertyValueService.editModeData?.values[this.index].uuid;
  }
}
