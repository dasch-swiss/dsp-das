import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, Subscription } from 'rxjs';
import { IIIFUrl } from './third-party-iiif';

@Component({
  selector: 'app-iiif-control',
  template: `
    @if (previewImageUrl) {
      <div class="third-party-iiif-preview">
        <img [src]="previewImageUrl" alt="IIIF Preview" height="240" />
      </div>
    }

    <mat-form-field style="width: 100%">
      <mat-label>{{ 'resourceEditor.representations.iiifControl.label' | translate }}</mat-label>
      <input
        matInput
        [formControl]="control"
        data-cy="external-iiif-input"
        [placeholder]="'resourceEditor.representations.iiifControl.placeholder' | translate" />

      @if (control.errors; as errors) {
        <mat-error> {{ errors | humanReadableError: validatorErrors }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      .third-party-iiif-preview {
        width: 100%;
        border: 1px solid #000;
        border-radius: 2px;
        padding: 16px 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        background-color: #f2f2f2;
        overflow: hidden;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class IiifControlComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control!: FormControl<string | null>;

  previewImageUrl?: string;

  private subscription!: Subscription;

  readonly validatorErrors = [
    { errorKey: 'invalidIiifUrl', translationKey: 'resourceEditor.representations.iiifControl.errors.invalidUrl' },
    { errorKey: 'previewImageError', translationKey: 'resourceEditor.representations.iiifControl.errors.previewImageError' },
    { errorKey: 'infoJsonError', translationKey: 'resourceEditor.representations.iiifControl.errors.infoJsonError' },
    { errorKey: 'invalidHost', translationKey: 'resourceEditor.representations.iiifControl.errors.invalidHost' },
  ];

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscription = this.control.valueChanges.pipe(startWith(this.control.value)).subscribe(urlStr => {
      const url = IIIFUrl.createUrl(urlStr ?? '');
      this.previewImageUrl = url?.previewImageUrl;
      this._cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
