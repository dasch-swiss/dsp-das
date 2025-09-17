import { ReadResource } from '@dasch-swiss/dsp-js';

export interface ResourceData {
  resources: ReadResource[];
  selectFirstResource: boolean;
  isSearchResult?: boolean;
}
