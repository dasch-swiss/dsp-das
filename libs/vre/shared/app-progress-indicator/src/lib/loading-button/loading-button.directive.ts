import { Directive, ElementRef, Input, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appLoadingButton]',
})
export class LoadingButtonDirective {
  @Input() isLoading: boolean = false;

  private spinnerElement: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Create a spinner element and append it to the button
    this.spinnerElement = this.createSpinnerElement();
    this.renderer.appendChild(this.el.nativeElement, this.spinnerElement);
  }

  // Listen for click events on the button
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.isLoading) {
      // Prevent click events when the button is in the loading state
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Update the button's appearance based on the loading state
  ngOnChanges(): void {
    if (this.isLoading) {
      this.disableButton();
      this.showSpinner();
    } else {
      this.enableButton();
      this.hideSpinner();
    }
  }

  private createSpinnerElement(): HTMLElement {
    const spinner = this.renderer.createElement('div');
    this.renderer.addClass(spinner, 'spinner');
    return spinner;
  }

  private disableButton(): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
  }

  private enableButton(): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
  }

  private showSpinner(): void {
    this.renderer.setStyle(this.spinnerElement, 'display', 'inline-block');
  }

  private hideSpinner(): void {
    this.renderer.setStyle(this.spinnerElement, 'display', 'none');
  }
}
