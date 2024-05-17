import { Component } from '@angular/core';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';

@Component({
  selector: 'app-compound-slider',
  template: ` <div *ngIf="compoundNavigation" class="compoundNavigation">
    <mat-slider
      [color]="'primary'"
      [disabled]="compoundNavigation.totalPages < 2"
      [max]="compoundNavigation.totalPages"
      [min]="1"
      [step]="1"
      showTickMarks
      discrete
      #ngSlider
      ><input
        matSliderThumb
        [(ngModel)]="compoundNavigation.page"
        (change)="
          openPage(
            {
              source: ngSliderThumb,
              parent: ngSlider,
              value: ngSliderThumb.value
            }.value
          )
        "
        #ngSliderThumb="matSliderThumb" />
    </mat-slider>
  </div>`,
})
export class CompoundSliderComponent {
  get compoundNavigation() {
    return this.incomingService.compoundPosition;
  }

  openPage(page: number) {
    this.incomingService.compoundNavigation(page);
  }

  constructor(public incomingService: IncomingRepresentationsService) {}
}
