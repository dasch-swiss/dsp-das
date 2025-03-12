import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-create-resource-form-legal',
  template: `
    <h2>Legal infos</h2>
    <div class="row">
      <h3>Copyright holder</h3>
      <mat-select placeholder="Copyright holder" [formControl]="form.controls.copyrightHolder">
        <mat-option *ngFor="let cal of copyrightHolders$ | async" [value]="cal">{{ cal }}</mat-option>
      </mat-select>
    </div>

    <div class="row">
      <h3>License</h3>
      <mat-select placeholder="License" [formControl]="form.controls.license">
        <mat-option *ngFor="let cal of licenses$ | async" [value]="cal">{{ cal }}</mat-option>
      </mat-select>
    </div>

    <div class="row">
      <h3>Authorship</h3>
      <mat-select placeholder="Authorship" [formControl]="form.controls.authorship">
        <mat-option *ngFor="let cal of authorships$ | async" [value]="cal">{{ cal }}</mat-option>
      </mat-select>
    </div>
  `,
})
export class CreateResourceFormLegalComponent {
  @Input({ required: true }) form!: any;
  copyrightHolders$!: any;
  licenses$!: any;
  authorships$!: any;
}
