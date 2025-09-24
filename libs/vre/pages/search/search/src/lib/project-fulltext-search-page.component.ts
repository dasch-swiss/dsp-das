import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { map, startWith, Subject } from 'rxjs';

@Component({
  selector: 'app-project-fulltext-search-page',
  template: `
    <div
      style="display: flex; justify-content: center; align-items: center; gap: 32px; padding: 16px;"
      [ngClass]="{ big: (isNotQuerying$ | async) }">
      <a mat-stroked-button [routerLink]="['..', 'advanced-search']">
        <mat-icon>swap_horiz</mat-icon>
        Switch to advanced search
      </a>
      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" style="width: 600px">
          <mat-label>Search in the entire project</mat-label>
          <input matInput [formControl]="formGroup.controls.query" type="text" placeholder="Enter search term..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </form>
    </div>

    @if (false) {
      <div
        style="
    display: flex
;
    justify-content: center;
;">
        <div
          style="
          max-width: 500px;
    border: 1px solid #ebebeb;
    padding: 16px">
          Search Tips:
          <ul>
            <li>Use quotation marks for exact phrases: "down the rabbit hole"</li>
            <li>Use AND, OR, NOT for boolean searches: Alice AND Wonderland</li>
            <li>Use wildcards: Alice* will match Alice, Alices, etc.</li>
          </ul>
        </div>
      </div>
    }

    @if (query$ | async; as query) {
      <mat-divider />

      <app-project-fulltext-search-result [query]="query" />
    }
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }

      .big {
        margin-top: 70px;
        flex-direction: column;
      }
    `,
  ],
})
export class ProjectFulltextSearchPageComponent {
  querySubject = new Subject<string>();
  query$ = this.querySubject.asObservable();
  isNotQuerying$ = this.query$.pipe(
    map(v => v === ''),
    startWith(true)
  );

  formGroup = this._fb.group({ query: [''] });

  constructor(private _fb: FormBuilder) {}

  onSubmit() {
    if (!this.formGroup.valid) {
      return;
    }

    this.querySubject.next(this.formGroup.controls.query.value!);
  }
}
