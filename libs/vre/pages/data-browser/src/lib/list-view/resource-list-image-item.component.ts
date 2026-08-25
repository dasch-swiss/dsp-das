import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, Inject, Input, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Constants, KnoraApiConnection, ReadResource, ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { catchError, map, of } from 'rxjs';
import { MultipleViewerService } from '../comparison/multiple-viewer.service';

/**
 * One tile of the grid view.
 *
 * The list query (see `ResourcesListFetcherComponent`) constructs only `isMainResource`, so the
 * resources handed down here carry a label and a class but no file value. The thumbnail therefore
 * costs one `getResource` per tile — acceptable for a page of results, but the reason a grid page
 * fills in progressively. Constructing the file value in the gravsearch would remove these calls.
 */
@Component({
  selector: 'app-resource-list-image-item',
  template: `
    <button
      type="button"
      class="tile"
      [class.no-image]="unavailable()"
      [class.highlighted]="isHighlighted$ | async"
      (click)="multipleViewerService.selectOneResource(resource)">
      @if (src(); as url) {
        <img [src]="url" [alt]="resource.label" loading="lazy" />
      } @else {
        <span class="placeholder"></span>
      }
      <span class="label"
        ><span>{{ resource.label }}</span></span
      >
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .tile {
        /* Button reset: the tile has to be a real button for keyboard and screen readers, but must
           not look like one. */
        appearance: none;
        border: none;
        padding: 0;
        margin: 0;
        font: inherit;
        cursor: pointer;

        display: block;
        width: 100%;
        position: relative;
        /* Square tiles, cropped to fill: the grid reads as a mosaic rather than a ragged
           collection of aspect ratios. */
        aspect-ratio: 1 / 1;
        overflow: hidden;
        background: #ebebeb;
      }

      img,
      .placeholder {
        width: 100%;
        height: 100%;
        display: block;
      }

      img {
        object-fit: cover;
      }

      .label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        text-align: center;
        color: #fff;
        font-size: 13px;
        line-height: 1.3;
        background: rgba(0, 0, 0, 0.55);
        opacity: 0;
        transition: opacity 150ms ease-in-out;
      }

      .label span {
        /* Four lines then ellipsis, so a long label cannot overflow the tile. */
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* :focus-visible, not :focus alone: the label should not flash open on every mouse click. */
      .tile:hover .label,
      .tile:focus-visible .label,
      /* Nothing to reveal on a tile with no thumbnail, so the label simply stays put. */
      .tile.no-image .label {
        opacity: 1;
      }

      .tile.no-image .label {
        color: rgba(0, 0, 0, 0.7);
        background: none;
      }

      /* Matches the list view's selection colour, drawn inside the tile so it does not
         disturb the grid's alignment. */
      .tile.highlighted {
        outline: 3px solid #33678f;
        outline-offset: -3px;
      }

      .tile:focus-visible {
        outline: 3px solid #33678f;
        outline-offset: -3px;
      }

      @media (prefers-reduced-motion: reduce) {
        .label {
          transition: none;
        }
      }
    `,
  ],
  imports: [AsyncPipe],
})
export class ResourceListImageItemComponent implements OnInit {
  @Input({ required: true }) resource!: ReadResource;

  readonly src = signal<string | undefined>(undefined);
  /** Distinguishes "still loading" from "this resource has no image", which look alike otherwise. */
  readonly unavailable = signal(false);

  /** Mirrors the list row: in single-select mode only the leading resource reads as selected. */
  isHighlighted$ = this.multipleViewerService.selectedResources$.pipe(
    map(resources => {
      if (this.multipleViewerService.selectMode) {
        return resources.map(r => r.id).includes(this.resource.id);
      }
      return resources.length > 0 && resources[0].id === this.resource.id;
    })
  );

  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    public readonly multipleViewerService: MultipleViewerService
  ) {}

  ngOnInit() {
    this._dspApiConnection.v2.res
      .getResource(this.resource.id)
      .pipe(
        // A tile that cannot load its own thumbnail must not take the grid down with it: not every
        // class in a project is a still image representation.
        catchError(() => of(null)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(resource => {
        const fileValue = resource?.properties[Constants.HasStillImageFileValue]?.[0] as
          ReadStillImageFileValue | undefined;

        if (!fileValue) {
          this.unavailable.set(true);
          return;
        }

        this.src.set(this._resizeIiifImage(fileValue.fileUrl));
      });
  }

  /**
   * Rewrites the size segment of a IIIF URL so the tile downloads a thumbnail rather than the full
   * image. Anything that is not a plain `/full/W,H/0/default.jpg` is left alone.
   */
  private _resizeIiifImage(url: string, maxSize = 400): string {
    const regex = /(\/full\/)(\d+),(\d+)(\/0\/default\.jpg)/;
    const match = url.match(regex);
    if (!match) {
      return url;
    }

    const originalWidth = parseInt(match[2], 10);
    const originalHeight = parseInt(match[3], 10);
    const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight, 1);

    return url.replace(regex, `$1${Math.round(originalWidth * scale)},${Math.round(originalHeight * scale)}$4`);
  }
}
