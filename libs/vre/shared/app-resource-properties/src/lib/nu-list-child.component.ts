import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Cardinality, KnoraApiConnection, UpdateResource, UpdateValue, WriteValueResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { finalize, take } from 'rxjs/operators';
import { FormValueArray } from './form-value-array.type';
import { NuListService } from './nu-list.service';

@Component({
  selector: 'app-nu-list-child',
  template: ` <div style="position: relative; min-height: 40px; width: 100%">
    <app-nu-list-action-bubble
      [editMode]="!displayMode"
      *ngIf="!nuListService.keepEditMode"
      [date]="'date'"
      [showDelete]="index > 0 || [Cardinality._0_1, Cardinality._0_n].includes(cardinality)"
      (editAction)="nuListService.toggle(index)"></app-nu-list-action-bubble>

    <div style="display: flex">
      <div>
        <ng-container
          *ngTemplateOutlet="itemTpl; context: { item: group.controls.item, displayMode: displayMode }"></ng-container>
        <mat-form-field style="flex: 1" subscriptSizing="dynamic" class="formfield" *ngIf="!displayMode">
          <textarea matInput rows="9" [placeholder]="'Comment'" [formControl]="group.controls.comment"></textarea>
        </mat-form-field>
      </div>
      <button
        (click)="updatedIndex(index)"
        mat-icon-button
        *ngIf="!displayMode && canUpdateForm && !loading"
        [disabled]="initialFormValue[index].item === group.value.item">
        <mat-icon>save</mat-icon>
      </button>
      <dasch-swiss-app-progress-indicator *ngIf="loading"></dasch-swiss-app-progress-indicator>
    </div>
  </div>`,
})
export class NuListChildComponent implements OnInit {
  @Input() itemTpl!: TemplateRef<any>;
  @Input() index!: number;
  @Input() formArray!: FormValueArray;
  @Input() canUpdateForm!: boolean;
  @Input() cardinality!: Cardinality;
  protected readonly Cardinality = Cardinality;

  initialFormValue: any;

  displayMode: boolean | undefined;
  loading = false;

  get group() {
    return this.formArray.at(this.index);
  }

  constructor(
    public nuListService: NuListService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initialFormValue = this.formArray.value;
    this._setupDisplayMode();
  }
  private _setupDisplayMode() {
    if (this.nuListService.keepEditMode) {
      this.displayMode = false;
      return;
    }
    this.nuListService.lastOpenedItem$.subscribe(value => {
      if (this.nuListService.currentlyAdding && this.displayMode === false) {
        this.formArray.removeAt(this.formArray.length - 1);
        this.nuListService.currentlyAdding = false;
        return;
      }

      this.displayMode = this.index !== value;
    });
  }

  updatedIndex(index: number) {
    const group = this.formArray.at(index);
    if (group.invalid) return;

    this.loading = true;

    this._dspApiConnection.v2.values
      .updateValue(this._getPayload(index))
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res: WriteValueResponse) => {
        this.displayMode = true;
        this._cdr.detectChanges();
      });
  }

  private _getUpdatedValue(index: number) {
    const group = this.formArray.at(index);
    const prop = this.nuListService._editModeData?.prop;
    const id = prop.values[index].id;
    const entity = propertiesTypeMapping.get(prop.propDef.objectType).updateMapping(id, group.controls.item.value);
    if (group.controls.comment.value) {
      entity.valueHasComment = group.controls.comment.value;
    }
    return entity;
  }

  private _getPayload(index: number) {
    const updateResource = new UpdateResource<UpdateValue>();
    const { resource, prop } = this.nuListService._editModeData as { resource: any; prop: any };
    updateResource.id = resource.id;
    updateResource.property = prop.values[index].property;
    updateResource.type = resource.type;
    updateResource.value = this._getUpdatedValue(index);
    return updateResource;
  }
}
