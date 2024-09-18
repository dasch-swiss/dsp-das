import { ShortResInfo } from '@dasch-swiss/vre/shared/app-ontology-classes';

export interface FilteredResources {
  count: number;
  resListIndex: number[];
  resInfo: ShortResInfo[];
  selectionType: 'multiple' | 'single';
}
