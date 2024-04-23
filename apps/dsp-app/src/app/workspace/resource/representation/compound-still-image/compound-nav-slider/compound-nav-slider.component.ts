import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompoundNavigationService } from '@dsp-app/src/app/workspace/resource/representation/still-image_/compound-navigation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-compound-nav-slider',
  templateUrl: './compound-nav-slider.component.html',
  styleUrls: ['./compound-nav-slider.component.scss'],
})
export class CompoundNavSliderComponent {
  totalPages$: Observable<number>;

  constructor(private _compoundNav: CompoundNavigationService) {}

  goToPage(page: number) {
    this._compoundNav.setPage(page);
  }
}
