import { Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ResourceCreationServiceInterface, ResourceCreationOptions } from '@dasch-swiss/vre/core/session';
import { Observable } from 'rxjs';

// This will be dynamically imported to avoid circular dependencies
interface ResourceCreationDialogProps extends ResourceCreationOptions {
  resourceType: string;
}

@Injectable({ providedIn: 'root' })
export class ResourceCreationService extends ResourceCreationServiceInterface {
  constructor(private _dialog: MatDialog) {
    super();
  }

  createResource(options: ResourceCreationOptions): Observable<string | undefined> {
    // For now, return a simple implementation that doesn't break circular dependencies
    // This could be enhanced later to use a dedicated dialog or form
    return new Observable(observer => {
      // Placeholder implementation - in a real scenario, this would open a creation form
      // For now, just complete with undefined to prevent errors
      observer.next(undefined);
      observer.complete();
    });
  }

  /**
   * Alternative method that could be used by dialogs that need a view container
   */
  createResourceWithDialog(
    options: ResourceCreationOptions & { resourceType: string },
    viewContainerRef?: ViewContainerRef
  ): Observable<string | undefined> {
    // This is where we could dynamically import the dialog to avoid circular dependencies
    // For now, return a placeholder
    return this.createResource(options);
  }
}
