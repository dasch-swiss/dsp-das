import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponseError, ReadResource } from '@dasch-swiss/dsp-js';
import { ResourceFetcherService, ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { filter, Subject, takeUntil } from 'rxjs';

type HideReason = 'NotFound' | 'Deleted' | 'Unauthorized' | null;

@Component({
  selector: 'app-resource-fetcher',
  template: `
    <div class="content large middle">
      <app-resource-version-warning
        *ngIf="resourceVersion"
        [resourceVersion]="resourceVersion"
        (navigateToCurrentVersion)="navigateToCurrentVersion()" />

      <ng-container *ngIf="!hideStatus; else hideTpl">
        <app-resource *ngIf="resource; else loadingTpl" [resource]="resource" />
      </ng-container>
    </div>

    <ng-template #hideTpl>
      <div style="display: flex; justify-content: center; padding: 16px">
        <h3 *ngIf="hideStatus === 'NotFound'">{{ 'resourceEditor.notFound' | translate }}</h3>

        <h3 *ngIf="hideStatus === 'Unauthorized'">{{ 'resourceEditor.unauthorized' | translate }}</h3>

        <div *ngIf="hideStatus === 'Deleted'" style="text-align: center">
          <h3>{{ 'resourceEditor.deleted' | translate }}</h3>
          <h4 *ngIf="resource?.res.deleteComment as comment">"{{ comment }}"</h4>
        </div>
      </div>
    </ng-template>

    <ng-template #loadingTpl>
      <app-progress-indicator />
    </ng-template>
  `,
  providers: [ResourceFetcherService],
})
export class ResourceFetcherComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) resourceIri!: string;
  @Output() afterResourceDeleted = new EventEmitter<ReadResource>();

  resource?: DspResource;
  hideStatus: HideReason = null;

  private _destroy$ = new Subject<void>();

  get resourceVersion(): string | undefined {
    const resourceVersion = this._route.snapshot.queryParamMap.get('version') || undefined;

    if (resourceVersion && !ResourceUtil.versionIsValid(resourceVersion)) {
      this._translateService.get('resourceEditor.versionNotValid').subscribe(v => {
        this._notification.openSnackBar(v);
      });
      return undefined;
    }
    return resourceVersion;
  }

  constructor(
    private _resourceFetcherService: ResourceFetcherService,
    private _notification: NotificationService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _translateService: TranslateService
  ) {}

  ngOnInit() {
    this._resourceFetcherService.resource$
      .pipe(
        filter(resource => !!resource),
        takeUntil(this._destroy$)
      )
      .subscribe(
        resource => {
          if (resource.res.type === 'http://api.knora.org/ontology/knora-api/v2#DeletedResource') {
            this.hideStatus = 'Deleted';
            this.resource = resource;
            this.afterResourceDeleted.emit(resource.res);
            return;
          }

          this.hideStatus = null;
          this.resource = resource;

          const hasResourceVersionOfLatestVersion =
            (!!this.resourceVersion && this.resourceVersion === resource.res.lastModificationDate) ||
            (!!this.resourceVersion && !resource.res.lastModificationDate);

          if (hasResourceVersionOfLatestVersion) {
            this._purgeVersionParam();
          }
        },
        err => {
          if (err instanceof ApiResponseError && err.status === 404) {
            this.hideStatus = 'NotFound';
            return;
          }

          if (err instanceof ApiResponseError && err.status === 403) {
            this.hideStatus = 'Unauthorized';
            return;
          }

          throw err;
        }
      );
  }

  ngOnChanges() {
    this.hideStatus = null;
    this.resource = undefined;
    console.debug(
      'ResourceFetcherComponent: resourceIri changed, loading resource',
      this.resourceIri,
      this.resourceVersion
    );
    this._resourceFetcherService.loadResource(this.resourceIri, this.resourceVersion);
  }

  navigateToCurrentVersion() {
    this._purgeVersionParam();
    this._resourceFetcherService.loadResource(this.resourceIri);
  }

  private _purgeVersionParam() {
    this._router.navigate([], {
      queryParams: { version: null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
