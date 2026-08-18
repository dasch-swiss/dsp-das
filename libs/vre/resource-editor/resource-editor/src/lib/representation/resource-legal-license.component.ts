import { Component, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { TranslatePipe } from '@ngx-translate/core';
import { LicensesLogoMapping } from '../licenses-logo-mapping';
import { isPlaceholderLegalValue } from './is-placeholder-file-value';

@Component({
  selector: 'app-resource-legal-license',
  template: `
    @if (isPlaceholder) {
      <!-- The placeholder license's uri is the sentinel itself, which is not dereferenceable — render
           the readable marker as plain text, with no link and no open_in_new icon (DEV-6982). -->
      <span>{{ 'resourceEditor.legal.placeholder' | translate }}</span>
    } @else if (licenseLogo) {
      <a
        [href]="license.uri"
        target="_blank"
        rel="noopener noreferrer"
        [attr.aria-label]="license.labelEn + ', ' + ('legal.dataSide.opensInNewTab' | translate)"
        ><img [src]="licenseLogo" [alt]="license.labelEn" style="width: 110px"
      /></a>
    } @else {
      <!-- Inline (not flex) so a wrapped label keeps the icon right after its last word instead of
           pushing it out to the far right as a flex sibling (DEV-6983). -->
      <a
        class="license-link"
        [href]="license.uri"
        target="_blank"
        rel="noopener noreferrer"
        [attr.aria-label]="license.labelEn + ', ' + ('legal.dataSide.opensInNewTab' | translate)">
        <span>{{ license.labelEn }} </span>
        <mat-icon class="license-icon" aria-hidden="true">open_in_new</mat-icon>
      </a>
    }
  `,
  styles: [
    `
      .license-link {
        color: white;
      }

      .license-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        /* Inline with the label text, so it trails the last wrapped line. */
        display: inline;
        vertical-align: middle;
      }
    `,
  ],
  imports: [MatIconModule, TranslatePipe],
})
export class ResourceLegalLicenseComponent implements OnChanges {
  @Input({ required: true }) license!: ProjectLicenseDto;
  licenseLogo?: string;
  isPlaceholder = false;

  ngOnChanges() {
    this.licenseLogo = LicensesLogoMapping.get(this.license.id) ?? undefined;
    this.isPlaceholder = isPlaceholderLegalValue(this.license.id);
  }
}
