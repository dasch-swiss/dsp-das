import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { FilteredResources } from '@dasch-swiss/vre/shared/app-common-to-move';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import {
  ResourceLinkDialogComponent,
  ResourceLinkDialogProps,
} from '../resource-link-dialog/resource-link-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-intermediate',
  template: `
    <div class="card-container" *ngIf="resources">
      <div class="card front">
        <div class="mock title"></div>
        <div class="mock title"></div>
        <div class="mock content">
          <p class="count">{{ resources.count }}</p>
          <p class="text">{{ resources.count | i18nPlural: itemPluralMapping['resource'] }} Selected</p>
        </div>
        <div class="action">
          <span class="fill-remaining-space"></span>
          <span>
            <!-- link button to create a link resource (linkObj) -->
            <button
              mat-mini-fab
              color="primary"
              class="link"
              *ngIf="mayHaveMultipleProjects === false"
              matTooltip="Create a link object from this selection"
              [matTooltipPosition]="'above'"
              [disabled]="resources.count < 2"
              (click)="openDialog()">
              <mat-icon>link</mat-icon>
            </button>
            <!-- TODO: add more functionality for multiple resources: edit (only if same resource type), add to favorites, delete etc. -->
            <!-- compare button to compare more than two resources -->
            <button
              mat-mini-fab
              color="primary"
              class="compare"
              matTooltip="Compare the selected resources"
              [matTooltipPosition]="'above'"
              [disabled]="resources.count < 2"
              (click)="action.emit('compare')">
              <mat-icon>compare_arrows</mat-icon>
            </button>
          </span>
          <span class="fill-remaining-space"></span>
        </div>
      </div>
      <div *ngIf="resources.count > 1" class="card background two"></div>
      <div *ngIf="resources.count > 2" class="card background three"></div>
      <div *ngIf="resources.count > 3" class="card background more"></div>
    </div>
  `,
  styleUrls: ['./intermediate.component.scss'],
})
export class IntermediateComponent implements OnInit, OnDestroy {
  private _resourcesSubject = new BehaviorSubject<FilteredResources | null>(null);
  private _resources!: FilteredResources;

  destroyed: Subject<void> = new Subject<void>();

  mayHaveMultipleProjects = true;
  uniqueSelectedProjectIris = new Set<string>();

  @Input({ required: true })
  set resources(value: FilteredResources) {
    this.uniqueSelectedProjectIris.clear();
    this.mayHaveMultipleProjects = true;
    this._resources = value;
    this._resourcesSubject.next(value);
  }

  get resources(): FilteredResources {
    return this._resources;
  }

  @Output() action = new EventEmitter<string>();

  itemPluralMapping = {
    resource: {
      '=1': 'Resource',
      other: 'Resources',
    },
  };

  constructor(
    private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _projectService: ProjectService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.collectSelectedProjectIrisSubscription();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  collectSelectedProjectIrisSubscription(): void {
    this._resourcesSubject
      .pipe(
        takeUntil(this.destroyed),
        switchMap(resources => {
          if (!resources || resources.resInfo.length === 0) return [null];
          return forkJoin(resources.resInfo.map(res => this._dspApiConnection.v2.res.getResource(res.id, undefined)));
        }),
        map((fetchedResources: any[] | null) => {
          if (!fetchedResources) return;

          fetchedResources.forEach(res => {
            if (res.attachedToProject) {
              this.uniqueSelectedProjectIris.add(res.attachedToProject);
            }
          });

          this.mayHaveMultipleProjects = this.uniqueSelectedProjectIris.size > 1;
          this._cd.markForCheck();
        })
      )
      .subscribe();
  }

  openDialog(): void {
    const projectUuid =
      this._route.parent?.snapshot.params[RouteConstants.uuidParameter] ??
      this._route.snapshot.params[RouteConstants.project];

    if (!projectUuid) {
      throw new AppError('Project UUID is missing.');
    }

    this._dialog.open<ResourceLinkDialogComponent, ResourceLinkDialogProps>(ResourceLinkDialogComponent, {
      data: {
        resources: this.resources,
        projectUuid: this._projectService.uuidToIri(projectUuid),
      },
    });
  }
}
