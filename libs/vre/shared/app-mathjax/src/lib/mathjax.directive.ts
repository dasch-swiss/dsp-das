import { Component, Directive, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { MathJaxService } from './mathjax.service';

@Directive({
  selector: '[appMathjax]',
})
export class MathjaxDirective {
  constructor(
    private _ele: ElementRef,
    private mathJaxService: MathJaxService
  ) {}

  ngOnInit() {
    this.mathJaxService.getMathJaxLoadedPromise().then(() => {
      this.mathJaxService.render(this._ele.nativeElement);
    });
  }
}
