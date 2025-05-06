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
    <app-progress-indicator *ngIf="previewStatus === 'LOADING'" />
    <div class="third-party-iiif-preview" *ngIf="control.valid">
      <img [src]="previewImageUrl" (load)="previewStatus = 'IDLE'" alt="IIIF Preview" height="240" />
    </div>

    <mat-form-field class="third-party-iiif-field">
      <mat-label>IIIF Image URL</mat-label>
      <input
        matInput
        [formControl]="control"
        placeholder="Enter IIIF image URL"
        data-cy="external-iiif-input"
        placeholder="Example: https://example.org/image-service/abcd1234/full/max/0/default.jpg" />

      <mat-hint>The URL must point to a valid IIIF image (jpg, tif, jp2, png).</mat-hint>
      <mat-error *ngIf="control.errors as errors"> {{ errors | humanReadableError: validatorErrors }}</mat-error>
    </mat-form-field>
  `,
  styleUrls: ['./third-party-iiif.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyIiifComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control!: FormControl<string | null>;

  previewImageUrl?: string;
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
