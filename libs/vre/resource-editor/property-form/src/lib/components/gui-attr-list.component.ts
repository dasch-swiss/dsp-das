import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-gui-attr-list',
  template: `
    <mat-form-field class="large-field">
      <span matPrefix> <mat-icon>tune</mat-icon>&nbsp; </span>
      <mat-label>Select a list</mat-label>
      <mat-select [formControl]="control"></mat-select>
      <mat-error *ngIf="control.invalid && control.touched && control.errors as errors">
        {{ errors[0] | humanReadableError }}
      </mat-error>
    </mat-form-field>
  `,
  styles: ['.large-field {width: 100%}'],
})
export class GuiAttrListComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
}
