import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Directive()
export class FormBase implements AfterViewInit, OnDestroy {
  private _touchAllControls$: Subject<any> = new Subject<any>();
  destroyed$ = new Subject<void>();
  formGroup: UntypedFormGroup = new UntypedFormGroup({});

  get touchAllControls$() {
    return this._touchAllControls$;
  }

  get controlNames(): string[] {
    return Object.keys(this.formGroup.controls);
  }

  constructor(
    protected el: ElementRef,
    protected renderer: Renderer2
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    this.disableSubmitButton();
  }

  setFormTouched() {
    this.formGroup.markAllAsTouched();
    this.controlNames.forEach(control => {
      this.formGroup.controls[control].updateValueAndValidity();
    });
  }

  private disableSubmitButton() {
    const submitButton = this.el.nativeElement.querySelector('button[type="submit"]');
    if (this.formGroup.invalid && submitButton) {
      this.renderer.setAttribute(submitButton, 'disabled', 'true');
    }
  }
}
