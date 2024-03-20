import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  iiifUrlValidator,
  infoJsonUrlValidatorAsync,
  previewImageUrlValidatorAsync,
} from '@dsp-app/src/app/workspace/resource/values/third-party-iiif/iiif-url-validator';
import { IiifUrl, IiiifUrlForm } from '@dsp-app/src/app/workspace/resource/values/third-party-iiif/third-party-iiif';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-third-part-iiif',
  templateUrl: './third-party-iiif.component.html',
})
export class ThirdPartyIiifComponent implements OnInit, OnDestroy {
  @Input() iiifUrlValue = '';

  form: IiiifUrlForm;

  previewImageUrl: string | null;

  private _destroy$ = new Subject<void>();

  readonly invalidIiifUrl = {
    errorKey: 'invalidIiifUrl',
    message: 'The provided URL is not a valid iiif image URL',
  };

  readonly previewImageError = {
    errorKey: 'previewImageError',
    message: 'The image can not be loaded from the third party server',
  };

  readonly infoJsonError = {
    errorKey: 'infoJsonError',
    message: 'The iiif info json can not be loaded from the third party server',
  };

  constructor(
    private _cdr: ChangeDetectorRef,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();

    this.form.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(changes => {
      const iiifUrl = IiifUrl.create(changes.url);
      this.previewImageUrl = iiifUrl?.previewImageUrl;
    });

    this.form.statusChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this._cdr.detectChanges(); // Manually trigger change detection
    });
  }

  buildForm() {
    this.form = this._fb.group({
      url: [
        this.iiifUrlValue,
        [Validators.required, iiifUrlValidator()],
        [previewImageUrlValidatorAsync(), infoJsonUrlValidatorAsync()],
      ],
    });
  }

  pasteFromClipboard() {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        this.form.controls.url.setValue(text);
        this.form.updateValueAndValidity();
      });
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
