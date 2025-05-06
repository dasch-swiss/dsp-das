import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  iiifUrlValidator,
  infoJsonUrlValidatorAsync,
  isExternalHostValidator,
  previewImageUrlValidatorAsync,
} from './iiif-url-validator';
import { IIIFUrl } from './third-party-iiif';

@Component({
  selector: 'app-third-part-iiif',
  template: `
    <div class="third-party-iiif-preview">
      <div
        *ngIf="(!previewImageUrl || !control.valid) && previewStatus === 'IDLE'"
        class="third-party-iiif-preview-placeholder">
        <mat-icon class="iiif-preview-icon">preview</mat-icon>
        <div>[ preview ]</div>
        <div class="mat-subtitle-2 iiif-url-explanation">
          The URL must point to a valid IIIF image (jpg, tif, jp2, png). <br />Example:
          https://example.org/image-service/abcd1234/full/max/0/default.jpg
        </div>
      </div>
      <app-progress-indicator *ngIf="previewStatus === 'LOADING'" />
      <img
        *ngIf="control?.valid"
        [src]="previewImageUrl"
        (load)="previewStatus = 'IDLE'"
        alt="IIIF Preview"
        height="240" />
    </div>

    <div class="mat-subtitle-2 paste-url-explanation">Paste a valid IIIF image URL to preview it here.</div>

    <mat-form-field class="third-party-iiif-field">
      <mat-label>IIIF Image URL</mat-label>
      <input matInput [formControl]="control" placeholder="Enter IIIF image URL" data-cy="external-iiif-input" />
      <mat-error *ngIf="control.errors as errors"> {{ errors | humanReadableError: validatorErrors }}</mat-error>
      <button
        *ngIf="control.value"
        [disabled]="control.valid"
        (click)="resetIfInvalid()"
        mat-icon-button
        matSuffix
        type="button"
        color="primary"
        data-cy="external-iiif-reset">
        <mat-icon>{{ control.valid ? 'check' : 'close' }}</mat-icon>
      </button>
      <button
        type="button"
        color="primary"
        mat-icon-button
        matSuffix
        matTooltip="Paste from clipboard"
        (click)="pasteFromClipboard()"
        data-cy="external-iiif-paste">
        <mat-icon>content_paste</mat-icon>
      </button>
    </mat-form-field>
  `,
  styleUrls: ['./third-party-iiif.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyIiifComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control!: FormControl<string | null>;

  previewImageUrl: string | undefined;
  previewStatus: 'LOADING' | 'IDLE' = 'IDLE';

  private subscription!: Subscription;

  readonly validatorErrors = [
    { errorKey: 'invalidIiifUrl', message: 'The provided URL is not a valid IIIF image URL.' },
    { errorKey: 'previewImageError', message: 'The image cannot be loaded from the third party server.' },
    { errorKey: 'infoJsonError', message: 'The IIIF info JSON can not be loaded from the third party server.' },
    { errorKey: 'invalidHost', message: 'The provided URL is not from an external source.' },
  ];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _fb: FormBuilder
  ) {
    this.control = this._fb.control('', {
      validators: [Validators.required, iiifUrlValidator(), isExternalHostValidator()],
      asyncValidators: [previewImageUrlValidatorAsync(), infoJsonUrlValidatorAsync()],
    });
  }

  ngOnInit() {
    this.subscription = this.control.valueChanges.subscribe(urlStr => {
      const iiifUrl = IIIFUrl.createUrl(urlStr || '');
      this.previewImageUrl = iiifUrl?.previewImageUrl;
      this._cdr.detectChanges();
    });
  }

  pasteFromClipboard() {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        this.control.setValue(text);
        this.control.markAsTouched();
      });
    }
  }

  resetIfInvalid() {
    if (this.control.invalid) {
      this.control.reset();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
