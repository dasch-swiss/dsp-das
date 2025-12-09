import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { AdminAPIApiService, ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';

@Component({
  selector: 'app-licenses-enabled-table',
  template: `
    <table style="width: 100%">
      <tr>
        <th>{{ label }}</th>
        <th>{{ 'pages.project.legalSettings.enabled' | translate }} ({{ enabledLicensesNumber }})</th>
      </tr>

      @for (license of licenses; track license) {
        <tr>
          <td>
            {{ license.labelEn }}
            <a [href]="license.uri" target="_blank">
              <mat-icon>launch</mat-icon>
            </a>
          </td>
          <td>
            <mat-checkbox [checked]="license.isEnabled" (change)="onLicenseToggle($event, license.id)" />
          </td>
        </tr>
      }
    </table>
  `,
  styles: [
    `
      table {
        border: 1px solid #f2f2f2;
      }

      tr {
        &:nth-child(odd) {
          background-color: #f2f2f2;
        }

        td,
        th {
          text-align: left;
          padding: 8px;
        }

        th {
          background-color: #dedede;
        }

        td:nth-of-type(2) {
          width: 90px;
          text-align: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LicensesEnabledTableComponent {
  @Input({ required: true }) licenses!: ProjectLicenseDto[];
  @Input({ required: true }) project!: ReadProject;
  @Input({ required: true }) label!: string;
  @Output() refresh = new EventEmitter<void>();

  get enabledLicensesNumber() {
    return this.licenses.filter(license => license.isEnabled).length;
  }

  constructor(private readonly _adminApiService: AdminAPIApiService) {}

  enable(licenseIri: string) {
    this._adminApiService
      .putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriEnable(this.project.shortcode, licenseIri)
      .subscribe({
        error: () => {
          this.refresh.emit();
        },
      });
  }

  disable(licenseIri: string) {
    this._adminApiService
      .putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriDisable(this.project.shortcode, licenseIri)
      .subscribe({
        error: () => {
          this.refresh.emit();
        },
      });
  }

  onLicenseToggle(event: MatCheckboxChange, licenseId: string) {
    // Optimistic update: immediately update local state
    const license = this.licenses.find(l => l.id === licenseId);
    if (license) {
      license.isEnabled = event.checked;
    }

    if (event.checked) {
      this.enable(licenseId);
    } else {
      this.disable(licenseId);
    }
  }
}
