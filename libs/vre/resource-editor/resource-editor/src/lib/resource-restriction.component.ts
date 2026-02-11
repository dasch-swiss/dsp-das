import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AlertInfoComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-resource-restriction',
  template: ` @if (showRestrictedMessage) {
    <div>
      <app-alert-info>
        <p>
          {{ 'resourceEditor.restricted' | translate }}
        </p>
        <mat-icon class="close" data-cy="close-restricted-button" (click)="showRestrictedMessage = false"
          >clear
        </mat-icon>
      </app-alert-info>
    </div>
  }`,
  imports: [MatIconModule, TranslatePipe, AlertInfoComponent],
})
export class ResourceRestrictionComponent {
  showRestrictedMessage = true;
}
