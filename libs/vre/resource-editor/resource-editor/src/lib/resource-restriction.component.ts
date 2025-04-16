import { Component } from '@angular/core';

@Component({
  selector: 'app-resource-restriction',
  template: ` <div *ngIf="showRestrictedMessage">
    <app-alert-info>
      <p>
        This resource is restricted, file representations may be of lower quality and some properties may be hidden.
      </p>
      <mat-icon class="close" data-cy="close-restricted-button" (click)="showRestrictedMessage = false"
        >clear
      </mat-icon>
    </app-alert-info>
  </div>`,
})
export class ResourceRestrictionComponent {
  showRestrictedMessage = true;
}
