import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project-fulltext-search-page',
  template: `
    <form [formGroup]="formGroup" (ngSubmit)="onSubmit()" style="display: flex; justify-content: center">
      <mat-form-field appearance="outline" style="width: 600px">
        <mat-label>Search in the entire project</mat-label>
        <input matInput [formControl]="formGroup.controls.query" type="text" placeholder="Enter search term..." />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </form>

    @if (querySubject | async; as query) {
      <mat-divider style="margin-top: 32px" />

      <app-fulltext-search-result-page [query]="query" />
    }
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }
    `,
  ],
})
export class ProjectFulltextSearchPageComponent {
  querySubject = new Subject<string>();

  formGroup = this._fb.group({ query: [''] });

  constructor(private _fb: FormBuilder) {}
  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }

    this.querySubject.next(this.formGroup.controls.query.value!);
  }
}
