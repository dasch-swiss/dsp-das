import { Directive, ElementRef, HostListener } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '[appInvalidControlScroll]'
})
export class InvalidControlScrollDirective {

    constructor(
        private _el: ElementRef,
        private _formGroupDir: FormGroupDirective
    ) { }

    @HostListener("ngSubmit") submitData() {
        if (this._formGroupDir.control.invalid) {
          this._scrollToFirstInvalidControl();
        }
      }

    private _scrollToFirstInvalidControl() {
        const firstInvalidControl: HTMLElement = this._el.nativeElement.querySelector(
            "form .ng-invalid"
        );

        firstInvalidControl.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        });
    }

}
