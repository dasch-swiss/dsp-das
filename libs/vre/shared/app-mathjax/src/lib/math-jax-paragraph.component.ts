import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MathJaxService } from './math-jax.service';

@Component({
  selector: 'app-math-jax-paragraph',
  template: '<p #mathParagraph></p>',
})
export class MathJaxParagraphComponent {
  @ViewChild('mathParagraph') paragraphElement!: ElementRef<HTMLParagraphElement>;
  @Input({ required: true }) mathString!: string;

  constructor(private mathJaxService: MathJaxService) {}

  ngOnInit() {
    this.mathJaxService.getMathJaxLoadedPromise().then(() => {
      this.paragraphElement.nativeElement.innerHTML = this.mathString;
      // this.mathJaxService.render(this.paragraphElement.nativeElement);
    });
  }
}
