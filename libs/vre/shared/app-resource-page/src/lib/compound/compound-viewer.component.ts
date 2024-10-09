import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReadProject } from '@dasch-swiss/dsp-js';
import {
  FileRepresentation,
  RepresentationService,
  StillImageComponent,
  getFileValue,
} from '@dasch-swiss/vre/shared/app-representations';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { CompoundService } from './compound.service';

@Component({
  selector: 'app-compound-viewer',
  template: `
    <ng-container *ngIf="compoundService.compoundPosition">
      <ng-container *ngIf="compoundService.incomingResource as incomingResource">
        <ng-container *ngIf="attachedProject$ | async as attachedProject">
          <app-still-image
            #stillImageComponent
            class="dsp-representation stillimage"
            [attachedProject]="attachedProject"
            *ngIf="imageIsAccessible"
            [resource]="incomingResource.res">
            <div navigationArrows class="arrows">
              <app-compound-arrow-navigation [forwardNavigation]="false" class="arrow" />
              <app-compound-arrow-navigation [forwardNavigation]="true" class="arrow" />
            </div>
            <app-compound-navigation navigation />
            <app-compound-slider slider />
          </app-still-image>
        </ng-container>
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
export class CompoundViewerComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject<void>();

  @ViewChild('stillImageComponent') stillImageComponent: StillImageComponent | undefined;

  attachedProject$: Observable<ReadProject | undefined> = this._store.select(ResourceSelectors.attachedProjects).pipe(
    filter(attachedProjects => !!attachedProjects && Object.values(attachedProjects).length > 0),
    map(attachedProjects =>
      this._rs.getParentResourceAttachedProject(attachedProjects, this.compoundService?.resource.res)
    )
  );

  get fileRepresentation() {
    return new FileRepresentation(getFileValue(this.compoundService.incomingResource!)!);
  }

  get imageIsAccessible() {
    return this.fileRepresentation.fileValue;
  }

  constructor(
    public compoundService: CompoundService,
    private _store: Store,
    private _rs: RepresentationService
  ) {}

  ngOnInit() {
    this.compoundService.onOpenNotLoadedIncomingResourcePage$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.stillImageComponent?.setForbiddenStatus();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
