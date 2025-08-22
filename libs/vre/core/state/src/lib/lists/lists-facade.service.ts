import { Injectable } from '@angular/core';
import { ListNodeInfo, ReadProject } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListsFacade {
  constructor(private _listApiService: ListApiService) {}

  getListsInProject$(project: ReadProject): Observable<ListNodeInfo[]> {
    return this._listApiService.listInProject(project.id).pipe(map(response => response.lists));
  }
}
