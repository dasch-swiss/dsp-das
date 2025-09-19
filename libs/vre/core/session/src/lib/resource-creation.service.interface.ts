import { Observable } from 'rxjs';

export interface ResourceCreationOptions {
  resourceClassIri: string;
  projectIri: string;
  projectShortcode: string;
}

/**
 * Service interface for creating resources.
 * This abstraction breaks circular dependencies by allowing components
 * to depend on the interface rather than concrete implementations.
 */
export abstract class ResourceCreationServiceInterface {
  /**
   * Opens a resource creation form/dialog and returns the created resource IRI
   */
  abstract createResource(options: ResourceCreationOptions): Observable<string | undefined>;
}
