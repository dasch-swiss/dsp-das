import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { Md5 } from 'ts-md5';
import { AdminImageConfig } from './admin-image.config';

@Directive({
  selector: '[appAdminImage]',
})
export class AdminImageDirective implements OnChanges {
  /**
   * @param {string} image
   *
   * source of the image;
   * - in the case of user (gr)avatar it's the e-mail address,
   * - in the case of project logo it's the image url
   */
  @Input({ required: true }) image!: string;

  /**
   * @param {string} type
   *
   * type of image; you can use it with
   * - project
   * - user
   */
  @Input({ required: true }) type!: string;

  /**
   * image source
   */
  source!: string;

  /**
   * in case of an error
   */
  onError: string = AdminImageConfig.defaultNotFound;

  constructor(
    private _renderer: Renderer2,
    private _ele: ElementRef
  ) {}

  ngOnChanges() {
    this.source = this.image;

    switch (this.type) {
      case 'user':
        this.onError = AdminImageConfig.defaultUser;

        if (this.image === null || this.image === undefined) {
          this.source = AdminImageConfig.defaultUser;
        } else {
          // TODO
          // eslint-disable-next-line no-restricted-globals
          this.source = `${location.protocol}//www.gravatar.com/avatar/${Md5.hashStr(this.image)}?d=mp&s=256`;
        }

        break;

      case 'project':
        this.onError = AdminImageConfig.defaultProject;

        if (this.image === null || this.image === undefined) {
          this.source = AdminImageConfig.defaultProject;
        }

        break;

      default:
        this.source = this.image;
    }

    this._renderer.setAttribute(this._ele.nativeElement, 'src', this.source);
    this._renderer.setAttribute(this._ele.nativeElement, 'onError', `this.src='${this.onError}'`);
  }
}
