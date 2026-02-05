import { Component } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-version-badge',
  template: `
    @if (!dsp.production) {
      <div class="mat-label-medium" style="display: flex; border-radius: 4px; overflow: hidden">
        <span
          style="background-color: var(--mat-sys-inverse-surface); color: var(--mat-sys-inverse-on-surface); padding: 4px 8px">
          {{ dsp.environment }}
        </span>
        <span style="background-color: var(--mat-sys-secondary); color: var(--mat-sys-on-secondary); padding: 4px 8px">
          {{ dsp.release }}
        </span>
      </div>
    }
  `,
})
export class VersionBadgeComponent {
  dsp = this._appConfigService.dspConfig;

  constructor(private readonly _appConfigService: AppConfigService) {}
}
