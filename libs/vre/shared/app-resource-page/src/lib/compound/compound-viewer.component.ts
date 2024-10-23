import { Component, OnDestroy, ViewChild } from '@angular/core';
import { StillImageComponent } from '@dasch-swiss/vre/shared/app-representations';
import { Subject } from 'rxjs';
import { CompoundService } from './compound.service';

@Component({
  selector: 'app-compound-viewer',
  template: `
    <ng-container *ngIf="compoundService.compoundPosition">
      <ng-container *ngIf="compoundService.incomingResource as incomingResource">
        <app-still-image #stillImageComponent class="dsp-representation stillimage" [resource]="incomingResource.res">
          <div navigationArrows class="arrows">
            <app-compound-arrow-navigation [forwardNavigation]="false" class="arrow" />
            <app-compound-arrow-navigation [forwardNavigation]="true" class="arrow" />
          </div>
          <app-compound-navigation navigation />
          <app-compound-slider slider />
        </app-still-image>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
      .arrow {
        position: absolute;
        z-index: 1;
        height: 100%;

        &:first-child {
          left: 0;
        }

        &:nth-child(2) {
          right: 0;
        }
      }
    `,
  ],
})
export class CompoundViewerComponent implements OnDestroy {
  destroyed$: Subject<void> = new Subject<void>();

  @ViewChild('stillImageComponent') stillImageComponent: StillImageComponent | undefined;

  constructor(public compoundService: CompoundService) {}

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
