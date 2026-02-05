import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchTipsComponent } from './search-tips.component';

@Component({
  selector: 'app-global-search',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    OverlayModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    TranslatePipe,
  ],
  template: `
    <form [formGroup]="formGroup" (ngSubmit)="search()">
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="compact-search"
        (focus)="showSearchTips()"
        (blur)="hideSearchTips()">
        <mat-label>{{ 'shared.header.searchEverywhere' | translate }}</mat-label>
        <input matInput #searchInput [formControl]="formGroup.controls.search" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </form>
  `,
  styleUrls: ['./global-search.component.scss'],
})
export class GlobalSearchComponent implements OnDestroy {
  formGroup = this._fb.group({
    search: ['', [Validators.minLength(3)]],
  });
  private overlayRef: OverlayRef | null = null;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly _router: Router,
    private readonly _fb: FormBuilder,
    private readonly _overlay: Overlay
  ) {}

  showSearchTips() {
    if (this.overlayRef) {
      return;
    }

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this.searchInput)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 25,
          offsetX: -130,
        },
      ]);

    this.overlayRef = this._overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      width: '570px',
    });

    const portal = new ComponentPortal(SearchTipsComponent);
    this.overlayRef.attach(portal);
  }

  hideSearchTips() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
  search() {
    this.hideSearchTips();
    const query = this.formGroup.controls.search.value;
    this._router.navigate([RouteConstants.search, query]);
  }

  ngOnDestroy() {
    this.hideSearchTips();
  }
}
