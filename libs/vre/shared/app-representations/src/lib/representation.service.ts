import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { FileInfo } from './representation.types';
import { ReadProject, ReadResource } from '@dasch-swiss/dsp-js';
import { IKeyValuePairs, ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root',
})
export class RepresentationService {
  constructor(
    private _appConfigService: AppConfigService,
    private readonly _http: HttpClient,
    private _store: Store
  ) {}

  getFileInfo(url: string, imageFilename?: string) {
    let pathToJson = '';

    if (imageFilename) {
      const index = url.indexOf(imageFilename);
      pathToJson = `${url.substring(0, index + imageFilename.length)}/knora.json`;
    } else {
      pathToJson = `${url.substring(0, url.lastIndexOf('/'))}/knora.json`;
    }

  getFileInfo(url: string) {
    const pathToJson = `${url.substring(0, url.lastIndexOf('/'))}/knora.json`;
    return this._http.get<{ originalFilename?: string }>(pathToJson, { withCredentials: true });
  }

  getIngestFileInfo(projectShort: string, assetId: string): Observable<FileInfo> {
    const url = `${this._appConfigService.dspIngestConfig.url}/projects/${projectShort}/assets/${assetId}`;
    return this._http.get<FileInfo>(url);
  }
  
  getAttachedProject(parentResource: ReadResource): ReadProject | undefined {
    const attachedProjects = this._store.selectSnapshot(ResourceSelectors.attachedProjects);
    const attachedProject = this.getParentResourceAttachedProject(attachedProjects, parentResource);
    return attachedProject;
  }

  getParentResourceAttachedProject(attachedProjects: IKeyValuePairs<ReadProject>, parentResource: ReadResource) {
    return attachedProjects[parentResource.id] && attachedProjects[parentResource.id].value.length > 0
      ? attachedProjects[parentResource.id].value.find(u => u.id === parentResource.attachedToProject)
      : undefined;
  }

  async downloadFile(url: string, imageFilename?: string) {
    const res = await this._http.get(url, { responseType: 'blob', withCredentials: true }).toPromise();

    this.getFileInfo(url, imageFilename).subscribe(response => {
      const originalFilename = response.originalFilename;

      const objUrl = window.URL.createObjectURL(res);
      const e = document.createElement('a');
      e.href = objUrl;

      // set filename
      if (originalFilename === undefined) {
        e.download = url.substring(url.lastIndexOf('/') + 1);
      } else {
        e.download = originalFilename;
      }

  downloadFile(url: string, fileName?: string) {
    this._http
      .get(url, { responseType: 'blob', withCredentials: true })
      .pipe(take(1))
      .subscribe(res => {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(res);
        a.download = fileName || url.split('/').pop()!;
        a.click();
        window.URL.revokeObjectURL(a.href);
      });
  }
}
