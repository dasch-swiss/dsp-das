import { Injectable } from '@angular/core';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';

@Injectable({
  providedIn: 'root',
})
export class AbTestService {
  resourceClasSelected: {
    classLabel: string;
    ontologyLabel: string;
    resClass: ResourceClassDefinitionWithAllLanguages;
  } | null = null;
}
