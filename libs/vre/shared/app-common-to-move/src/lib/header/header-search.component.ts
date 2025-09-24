import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-header-search',
  template: `
    <form
      [formGroup]="formGroup"
      (ngSubmit)="search()"
      style="border: 1px solid #ebebeb; display: flex; align-items: center; height: 40px">
      <input
        [formControl]="formGroup.controls.search"
        style="border: none; outline: none; padding: 0 16px; font-size: 14px; min-width: 260px"
        placeholder="Search everywhere" />
      <button mat-icon-button class="small-icon-button">
        <mat-icon>search</mat-icon>
      </button>
    </form>
  `,
  styles: [
    `
      .small-icon-button {
        transform: scale(0.8);
      }
    `,
  ],
})
export class HeaderSearchComponent {
  formGroup = this._fb.group({
    search: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor(
    private _router: Router,
    private _fb: FormBuilder
  ) {}
  search() {
    const query = this.formGroup.controls.search.value;
    this._router.navigateByUrl('/').then(() => this._router.navigate([RouteConstants.search, query]));
  }
}
