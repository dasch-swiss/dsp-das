import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ListItemService {
  onUpdate$ = new Subject();
  private _projectInfos: {
    projectIri: string;
  };
  get projectInfos() {
    return this._projectInfos;
  }

  setProjectInfos(projectIri: string) {
    this._projectInfos = {
      projectIri,
    };
  }
}
