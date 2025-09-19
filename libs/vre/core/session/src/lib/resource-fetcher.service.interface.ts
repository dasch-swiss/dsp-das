import { ReadResource } from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';

/**
 * Interface for resource fetcher to break circular dependencies.
 * Provides access to current resource and project information.
 */
export abstract class ResourceFetcherServiceInterface {
  abstract readonly resource$: Observable<{ res: ReadResource }>;
  abstract readonly projectShortcode$: Observable<string>;
  abstract readonly resourceVersion?: string;
  abstract reload(): void;
}
