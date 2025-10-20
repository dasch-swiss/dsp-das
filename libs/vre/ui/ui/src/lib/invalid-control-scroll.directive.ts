import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '[appInvalidControlScroll]',
  standalone: false,
})
export class InvalidControlScrollDirective {
  constructor(
    private readonly _el: ElementRef,
    private readonly _formGroupDir: FormGroupDirective
  ) {}

  @HostListener('ngSubmit') submitData() {
    if (this._formGroupDir.control.invalid) {
      this._scrollToFirstInvalidControl();
    }
  }

  /**
   * target the first invalid element of the resource-instance form (2nd panel property) and scroll to it
   */
  private _scrollToFirstInvalidControl() {
    // target the first invalid form field
    const firstInvalidControl: HTMLElement = this._el.nativeElement.querySelector('.ng-invalid:not([ng-reflect-form])');

    if (!firstInvalidControl) {
      return;
    }

    // scroll to the first invalid element in a smooth way
    firstInvalidControl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }
}
