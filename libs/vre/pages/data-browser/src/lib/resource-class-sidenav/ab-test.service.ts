import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AbTestService {
  isFullNavigation = true;
  resourceClasSelected: { classLabel: string; ontologyLabel: string } | null = null;
}
