import { Component, Input, OnInit } from '@angular/core';
import { ReadFileValue } from '@dasch-swiss/dsp-js';
import { AdminAPIApiService, ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { switchMap, take } from 'rxjs';
import { isPlaceholderLegalValue } from './is-placeholder-file-value';
import { ResourceFetcherService } from './resource-fetcher.service';
import { ResourceLegalLicenseComponent } from './resource-legal-license.component';

const PLACEHOLDER_LABEL_KEY = 'resourceEditor.legal.placeholder';

@Component({
  selector: 'app-resource-legal',
  template: `
    @if (fileValue.copyrightHolder || fileValue.authorship?.length > 0 || fileValue.license) {
      <div class="legal-panel mat-caption">
        <!-- One label/value grid so all three values align in a single column and each wraps inside
             its own column. A two-child "space-between" flex row had no gap and no width bound on the
             license, so a long label fused into the rows beside it (DEV-6983). -->
        <div class="meta-grid">
          @if (fileValue.copyrightHolder) {
            <span class="label">{{ 'resourceEditor.legal.copyrightHolder' | translate }}</span>
            <span class="value">
              @if (isPlaceholderCopyrightHolder) {
                {{ 'resourceEditor.legal.placeholder' | translate }}
              } @else {
                {{ fileValue.copyrightHolder }}
              }
            </span>
          }
          @if (fileValue.authorship.length > 0) {
            <span class="label">{{ 'resourceEditor.legal.authorship' | translate }}</span>
            <!-- Joined in the component so the separator cannot pick up stray template whitespace. -->
            <span class="value">{{ authorship }}</span>
          }
          @if (license) {
            <span class="label">{{ 'resourceEditor.legal.license' | translate }}</span>
            <span class="value">
              <app-resource-legal-license [license]="license" />
            </span>
          } @else if (isLoadingLicense) {
            <span class="label">{{ 'resourceEditor.legal.license' | translate }}</span>
            <span class="value"><app-progress-indicator [compact]="true" size="xsmall" /></span>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .legal-panel {
        border: 1px solid #292929;
        text-align: left;
        background: #292929;
        border-radius: 8px;
        color: #e4e9ed;
        padding: 8px;
        padding-bottom: 16px;
        margin-top: 8px;
        position: relative;
        top: 12px;
      }

      /* Same pattern as region-preview-viewer's .meta-grid: labels size to content, values take the
         rest and wrap within their own column. */
      .meta-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 20px;
        row-gap: 5px;
        /* Values may wrap to several lines — align them to the top of the row, not centred against a
           single-line label. */
        align-items: start;
      }

      .label {
        font-weight: bold;
      }

      .value {
        /* Let a long value wrap inside the column instead of forcing the grid wider. */
        min-width: 0;
        overflow-wrap: break-word;
      }
    `,
  ],
  imports: [TranslatePipe, ResourceLegalLicenseComponent, AppProgressIndicatorComponent],
})
export class ResourceLegalComponent implements OnInit {
  @Input({ required: true }) fileValue!: ReadFileValue;

  licenses: ProjectLicenseDto[] = [];
  isLoadingLicense = false;

  get license() {
    return this.licenses.find(license => license.id === this.fileValue.license?.id);
  }

  /**
   * dsp-tools writes the placeholder sentinel into the legal fields when the real legal info is not
   * known yet. Show the readable marker rather than the raw URN (DEV-6982).
   */
  get isPlaceholderCopyrightHolder(): boolean {
    return isPlaceholderLegalValue(this.fileValue.copyrightHolder);
  }

  /** Placeholder entries are replaced by the readable marker; the sentinel is per-entry, so a mixed
   *  list is handled too. */
  get authorship(): string {
    return this.fileValue.authorship
      .map(author => (isPlaceholderLegalValue(author) ? this._translate.instant(PLACEHOLDER_LABEL_KEY) : author))
      .join(', ');
  }

  constructor(
    private readonly _adminApiService: AdminAPIApiService,
    private readonly _resourceFetcher: ResourceFetcherService,
    private readonly _translate: TranslateService
  ) {}

  ngOnInit() {
    if (this.fileValue.license) {
      this.isLoadingLicense = true;
      this._fetchLicense();
    }
  }

  private _fetchLicense() {
    this._resourceFetcher.projectShortcode$
      .pipe(
        switchMap(projectShortcode =>
          this._adminApiService.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(projectShortcode)
        ),
        take(1)
      )
      .subscribe({
        next: data => {
          this.licenses = data.data;
          this.isLoadingLicense = false;
        },
        error: () => {
          this.isLoadingLicense = false;
        },
      });
  }
}
