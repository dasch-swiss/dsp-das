import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
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
        (click)="updatedIndex.emit(index)"
        mat-icon-button
        *ngIf="!displayMode && canUpdateForm"
        [disabled]="initialFormValue[index].item === group.value.item">
        <mat-icon>save</mat-icon>
      </button>
    </div>
  </div>`,
})
export class NuListChildComponent implements OnInit {
  @Input() itemTpl!: TemplateRef<any>;
  @Input() index!: number;
  @Input() formArray!: FormValueArray;
  @Input() canUpdateForm!: boolean;
  @Input() cardinality!: Cardinality;
  @Output() updatedIndex = new EventEmitter<number>();
  protected readonly Cardinality = Cardinality;

  initialFormValue: any;

  displayMode!: boolean;

  get group() {
    return this.formArray.at(this.index);
  }

  constructor(public nuListService: NuListService) {}

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
      this.displayMode = this.index !== value;
    });
  }
}
