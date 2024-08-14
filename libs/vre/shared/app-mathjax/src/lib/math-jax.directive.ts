import { Directive, ElementRef } from '@angular/core';
import { MathJaxService } from './math-jax.service';

@Directive({
  selector: '[appMathjax]',
})
export class MathJaxDirective {
  constructor(
    private _ele: ElementRef,
    private mathJaxService: MathJaxService
  ) {}

  ngOnInit() {
    if (MathJaxService.containsLatex(this._ele.nativeElement.innerHTML)) {
      this.mathJaxService.getMathJaxLoadedPromise().then(() => {
        this.mathJaxService.render(this._ele.nativeElement);
      });
    }
  }
}
