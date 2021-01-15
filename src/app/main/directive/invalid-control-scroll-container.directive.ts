import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appInvalidControlScrollContainer]'
})
export class InvalidControlScrollContainerDirective {

    readonly containerEl: HTMLElement = this._el.nativeElement;

    constructor(private _el: ElementRef) { }

}
