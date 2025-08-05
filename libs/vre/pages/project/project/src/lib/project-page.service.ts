import { Injectable } from '@angular/core';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { filterNull } from '@dasch-swiss/vre/shared/app-common';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ProjectPageService {
  private _currentProjectSubject = new BehaviorSubject<ReadProject | null>(null);
  currentProject$ = this._currentProjectSubject.asObservable().pipe(filterNull());

  constructor(private projectApiService: ProjectApiService) {}

  setCurrentProject(projectUuid: string): void {
    this.projectApiService.get(projectUuid).subscribe(response => {
      this._currentProjectSubject.next(response.project);
    });
  }
}
