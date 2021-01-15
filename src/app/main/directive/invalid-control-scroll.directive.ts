import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { take } from 'rxjs/internal/operators/take';

import { InvalidControlScrollContainerDirective } from "./invalid-control-scroll-container.directive";

@Directive({
  selector: '[appInvalidControlScroll]'
})
export class InvalidControlScrollDirective {

    private get containerEl(): any {
        return this._scrollContainerDir ? this._scrollContainerDir.containerEl : window;
      }

    constructor(
        private _el: ElementRef,
        private _formGroupDir: FormGroupDirective,
        @Optional() private _scrollContainerDir: InvalidControlScrollContainerDirective
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

        this.containerEl.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start"
        });

        fromEvent(this.containerEl, "scrollIntoView")
            .pipe(
                debounceTime(100),
                take(1)
            )
            .subscribe(() => firstInvalidControl.focus());
    }

}
