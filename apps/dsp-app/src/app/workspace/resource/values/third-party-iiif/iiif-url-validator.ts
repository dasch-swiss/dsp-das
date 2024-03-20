import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IiifUrl } from '@dsp-app/src/app/workspace/resource/values/third-party-iiif/third-party-iiif';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function iiifUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const url = control.value;
    if (!url) {
      return null;
    }

    const iiifUrl = IiifUrl.create(url);

    if (!iiifUrl?.isValidIiifUrl) {
      return { invalidIiifUrl: true };
    }

    return null;
  };
}

function fetchUrl(url: string): Promise<void> {
  return fetch(url, { method: 'HEAD' }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  });
}

export function infoJsonUrlValidatorAsync(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const iiifUrl = IiifUrl.create(control.value);
    if (!iiifUrl) {
      return of(null);
    }

    const infoJsonUrl = iiifUrl.infoJsonUrl;

    return from(fetchUrl(infoJsonUrl)).pipe(
      map(() => null),
      catchError(() => of({ infoJsonError: true }))
    );
  };
}

export function previewImageUrlValidatorAsync(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const iiifUrl = IiifUrl.create(control.value);
    if (!iiifUrl) {
      return of(null);
    }
    const previewImageUrl = iiifUrl?.previewImageUrl;

    return from(fetchUrl(previewImageUrl)).pipe(
      map(() => null),
      catchError(() => of({ previewImageError: true }))
    );
  };
}
