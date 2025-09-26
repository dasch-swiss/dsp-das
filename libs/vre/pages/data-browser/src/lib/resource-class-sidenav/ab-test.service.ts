import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AbTestService {
  isFullNavigation = true;
  resourceClasSelected: string | null = null;
}
