import { Injectable } from '@angular/core';
import { AccessTokenService } from '@dasch-swiss/vre/shared/app-session';
import * as OpenSeadragon from 'openseadragon';
import { osdViewerConfig } from './osd-viewer.config';

@Injectable()
export class OpenSeaDragonService {
  private _viewer!: OpenSeadragon.Viewer;

  get viewer(): OpenSeadragon.Viewer {
    return this._viewer;
  }

  set viewer(htmlElement: HTMLElement) {
    this._viewer = new OpenSeadragon.Viewer({
      element: htmlElement,
      ...osdViewerConfig,
      loadTilesWithAjax: true,
      ajaxHeaders: {
        Authorization: `Bearer ${this._accessToken.getAccessToken()}`,
      },
    });

    this.viewer.addHandler('full-screen', args => {
      if (args.fullScreen) {
        htmlElement.classList.add('fullscreen');
      } else {
        htmlElement.classList.remove('fullscreen');
      }
    });
  }

  constructor(private _accessToken: AccessTokenService) {}
}
