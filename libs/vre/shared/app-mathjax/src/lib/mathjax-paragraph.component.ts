import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MathJaxService } from './mathjax.service';

@Component({
  selector: 'app-mathjax-paragraph',
  template: '<p #mathParagraph></p>',
})
export class MathJaxParagraphComponent {
  @ViewChild('mathParagraph') paragraphElement: any;
  @Input({ required: true }) mathString!: string;

  constructor(private mathJaxService: MathJaxService) {}

  ngOnInit() {
    this.mathJaxService.getMathJaxLoadedPromise().then(() => {
      this.paragraphElement.nativeElement.innerHTML = this.mathString;
      this.mathJaxService.render();
    });
  }
}
