import { Component } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-version-badge',
  imports: [],
  template: `
    @if (!dsp.production) {
      <div class="mat-label-medium" style="display: flex; border-radius: 4px; overflow: hidden">
        <span
          style="padding: 4px 8px; background-color: var(--mat-sys-inverse-surface); color: var(--mat-sys-inverse-on-surface)">
          {{ dsp.environment }}
        </span>
        <span [style.background-color]="releaseColor" [style.color]="releaseTextColor" style="padding: 4px 8px">
          {{ dsp.release }}
        </span>
      </div>
    }
  `,
})
export class VersionBadgeComponent {
  dsp = this._appConfigService.dspConfig;

  constructor(private readonly _appConfigService: AppConfigService) {}

  get releaseColor(): string {
    switch (this.dsp.color) {
      case 'accent':
        return 'var(--mat-sys-tertiary)';
      case 'warn':
        return 'var(--mat-sys-error)';
      default:
        return 'var(--mat-sys-primary)';
    }
  }

  get releaseTextColor(): string {
    switch (this.dsp.color) {
      case 'accent':
        return 'var(--mat-sys-on-tertiary)';
      case 'warn':
        return 'var(--mat-sys-on-error)';
      default:
        return 'var(--mat-sys-on-primary)';
    }
  }
}
