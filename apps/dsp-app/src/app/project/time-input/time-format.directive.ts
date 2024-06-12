import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTimeFormat]',
})
export class TimeFormatDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    let value = this.el.nativeElement.value;
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    const timePattern = /^(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?$/;
    const match = value.match(timePattern);
    if (match) {
      this.el.nativeElement.value = match[1] + (match[2] ? `:${match[2]}` : '') + (match[3] ? `:${match[3]}` : '');
    }
  }
}
