import { Component, Input } from '@angular/core';
import { CreateResourceFormInterface } from './create-resource-form.interface';

@Component({
  selector: 'app-create-resource-form-legal',
  template: `
    <h3>Legal infos</h3>

    <app-create-resource-form-row [label]="'Copyright holder'" [tooltip]="'Copyright holder'">
      <mat-select placeholder="Copyright holder" [formControl]="formGroup.controls.copyrightHolder">
        <mat-option *ngFor="let cal of copyrightHolders$ | async" [value]="cal">{{ cal }}</mat-option>
      </mat-select>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'License'" [tooltip]="'License'">
      <mat-select placeholder="License" [formControl]="formGroup.controls.license">
        <mat-option *ngFor="let cal of licenses$ | async" [value]="cal">{{ cal }}</mat-option>
      </mat-select>
    </app-create-resource-form-row>

    <app-create-resource-form-row [label]="'Authorship'" [tooltip]="'Authorship'">
      <mat-select placeholder="Authorship" [formControl]="formGroup.controls.authorship">
        <mat-option *ngFor="let cal of authorships$ | async" [value]="cal">{{ cal }}</mat-option>
      </mat-select>
    </app-create-resource-form-row>
  `,
})
export class CreateResourceFormLegalComponent {
  @Input({ required: true }) formGroup!: CreateResourceFormInterface['legal'];
  copyrightHolders$!: any;
  licenses$!: any;
  authorships$!: any;
}
