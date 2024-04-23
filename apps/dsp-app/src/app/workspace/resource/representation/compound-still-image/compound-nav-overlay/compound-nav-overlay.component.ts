import { Component } from '@angular/core';
import { CompoundNavigationService } from '@dsp-app/src/app/workspace/resource/representation/still-image_/compound-navigation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-compound-nav-overlay',
  templateUrl: './compound-nav-overlay.component.html',
  styleUrls: ['./compound-nav-overlay.component.scss'],
})
export class CompoundNavOverlayComponent {
  totalPages$: Observable<number>;
  currentPage$: Observable<number>;

  constructor(private _compoundNav: CompoundNavigationService) {
    this.totalPages$ = this._compoundNav.totalPages$;
    this.currentPage$ = this._compoundNav.currentPage$;
  }

  nextPage() {
    this._compoundNav.goToNextPage();
  }

  previousPage() {
    this._compoundNav.goToPreviousPage();
  }
}
