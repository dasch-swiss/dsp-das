import { Component, Input, TemplateRef } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-nu-list',
  template: ` <div *ngFor="let control of formArray.controls; let index = index" style="display: flex">
      <ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: control }"></ng-container>
      <button (click)="formArray.removeAt(index)" mat-icon-button>
        <mat-icon>delete</mat-icon>
      </button>
    </div>
    <button mat-raised-button (click)="add()">Add</button>`,
})
export class NuListComponent {
  @Input() itemTpl: TemplateRef<any>;
  @Input() formArray: FormArray;
  @Input() newControl: FormControl<any>;

  add() {
    this.formArray.push(this.newControl);
  }
}
