import { Component } from '@angular/core';
import { NoResultsFoundComponent } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-representation-error-message',
  imports: [NoResultsFoundComponent],
  template: ` <app-no-results-found
    [message]="'The resource has not loaded.'"
    style="display: block; padding: 16px" />`,
})
export class RepresentationErrorMessageComponent {}
