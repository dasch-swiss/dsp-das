import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ListItemService {
  onUpdate$ = new Subject();
}
