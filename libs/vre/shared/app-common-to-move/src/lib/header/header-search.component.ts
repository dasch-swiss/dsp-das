import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { SearchParams } from '../search-params.interface';

@Component({
  selector: 'app-header-search',
  template: `
      <form [formGroup]="formGroup" (ngSubmit)="search()" style="border: 1px solid #ebebeb; display: flex; align-items: center; height: 40px">
        <input
          [formControl]="searchControl"
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

  })
  searchControl = this._fb.control('');
  constructor(
    private _router: Router,
    private _fb: FormBuilder
  ) {}
  search() {
      this._router.navigateByUrl('/').then(() => this._router.navigate([RouteConstants.search, 'fulltext', query]));
    }
  }
}
