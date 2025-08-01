import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { KnoraApiConnection, ReadResource, ReadResourceSequence, ResourceClassDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { MatAutocompleteOptionsScrollDirective } from '@dasch-swiss/vre/shared/app-common';
import { debounceTime, filter, finalize, map, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { CreateResourceDialogComponent, CreateResourceDialogProps } from '../create-resource-dialog.component';
import { LinkValueDataService } from './link-value-data.service';

@Component({
  selector: 'app-link-value',
  template: `
    <mat-form-field style="width: 100%">
      <input
        #input
        matInput
        [formControl]="control"
        aria-label="resource"
        placeholder="Name of an existing resource"
        data-cy="link-input"
        (input)="onInputValueChange()"
        [matAutocomplete]="auto" />
      <mat-autocomplete
        #auto="matAutocomplete"
        requireSelection
        [displayWith]="displayResource.bind(this)"
        (closed)="handleNonSelectedValues()">
        <mat-option *ngIf="searchResultCount === 0" [disabled]="true"> No results were found.</mat-option>
        <mat-option
          *ngFor="let rc of _linkValueDataService.resourceClasses; trackBy: trackByResourceClassFn"
          (click)="openCreateResourceDialog($event, rc.id, rc.label)">
          Create New: {{ rc?.label }}
        </mat-option>
        <mat-option *ngIf="searchResultCount > 0" [disabled]="true"> {{ searchResultCount }} results found </mat-option>
        <mat-option *ngFor="let res of resources; trackBy: trackByResourcesFn" [value]="res.id">
          {{ res.label }}
        </mat-option>
        <mat-option *ngIf="loading" [disabled]="true" class="loader">
          <app-progress-indicator />
        </mat-option>
      </mat-autocomplete>
      <mat-hint>{{ 'resourceEditor.resourceProperties.valueComponents.searchHelp' | translate }}</mat-hint>
      <mat-error *ngIf="control.errors as errors">{{ errors | humanReadableError }}</mat-error>
    </mat-form-field>
  `,
  providers: [LinkValueDataService, MatAutocompleteOptionsScrollDirective],
})
export class LinkValueComponent implements OnInit, AfterViewInit, OnDestroy {
  private cancelPreviousCountRequest$ = new Subject<void>();
  private cancelPreviousSearchRequest$ = new Subject<void>();

  @Input({ required: true }) control!: FormControl<string>;
  @Input({ required: true }) propIri!: string;
  @Input({ required: true }) resourceClassIri!: string;
  @Input({ required: true }) defaultValue!: string;
  @ViewChild(MatAutocompleteTrigger) autoComplete!: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) auto!: MatAutocomplete;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @HostBinding('attr.scroll') matAutocompleteOptionsScrollDirective: MatAutocompleteOptionsScrollDirective | undefined;

  destroyed$ = new Subject<void>();
  loading = false;
  useDefaultValue = true;
  resources: ReadResource[] = [];
  readResource: ReadResource | undefined;

  searchResultCount = 0;
  nextPageNumber = 0;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    private _cd: ChangeDetectorRef,
    public _linkValueDataService: LinkValueDataService
  ) {}

  ngOnInit() {
    this._getResourceProperties();
  }

  ngAfterViewInit() {
    this._initAutocompleteScroll();
  }

  handleNonSelectedValues() {
    const text = this._getTextInput();
    if (text !== this.displayResource(this.control.value)) {
      this.input.nativeElement.value = '';
    }
  }

  onInputValueChange() {
    this.searchResultCount = 0;
    this.nextPageNumber = 0;
    this.resources = [];
    const searchTerm = this._getTextInput();
    if (!this.readResource || searchTerm?.length < 3) {
      return;
    }

    this.loading = true;
    const resourceClassIri = this._getRestrictToResourceClass(this.readResource as ReadResource)!;
    this._getResourcesListCount(searchTerm, resourceClassIri)
      .pipe(take(1))
      .subscribe(count => {
        this.searchResultCount = count;
        this._cd.markForCheck();
      });

    this._search(searchTerm);
  }

  openCreateResourceDialog(event: any, resourceClassIri: string, resourceType: string) {
    let myResourceId: string;
    event.stopPropagation();
    this._dialog
      .open<CreateResourceDialogComponent, CreateResourceDialogProps, string>(CreateResourceDialogComponent, {
        ...DspDialogConfig.mediumDialog({
          resourceType,
          resourceClassIri,
        }),
      })
      .afterClosed()
      .pipe(
        filter(resourceId => {
          if (!resourceId) {
            this.control.reset();
            return false;
          }
          return true;
        }),
        switchMap(resourceId => {
          myResourceId = resourceId as string;
          return this._dspApiConnection.v2.res.getResource(myResourceId);
        })
      )
      .subscribe(res => {
        this.resources = [];
        this.searchResultCount = 1;
        this.resources.push(res as ReadResource);
        this.control.setValue(myResourceId);
        this.autoComplete.closePanel();
        this._cd.detectChanges();
      });
  }

  trackByResourcesFn = (index: number, item: ReadResource) => `${index}-${item.id}`;

  trackByResourceClassFn = (index: number, item: ResourceClassDefinition) => `${index}-${item.id}`;

  displayResource(resId: string | null): string {
    if (this.useDefaultValue) return this.defaultValue;
    if (resId === null) return '';
    return this.resources.find(res => res.id === resId)?.label ?? '';
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private _getResourcesListCount(searchValue: string, resourceClassIri: string): Observable<number> {
    this.cancelPreviousCountRequest$.next();
    if (!searchValue || searchValue.length <= 2 || typeof searchValue !== 'string') return of(0);

    return this._dspApiConnection.v2.search
      .doSearchByLabelCountQuery(searchValue, {
        limitToResourceClass: resourceClassIri,
      })
      .pipe(
        takeUntil(this.cancelPreviousCountRequest$),
        map(response => response.numberOfResults)
      );
  }

  private _search(searchTerm: string, offset = 0) {
    this.cancelPreviousSearchRequest$.next();
    const resourceClassIri = this._getRestrictToResourceClass(this.readResource as ReadResource)!;
    this._dspApiConnection.v2.search
      .doSearchByLabel(searchTerm, offset, {
        limitToResourceClass: resourceClassIri,
      })
      .pipe(
        takeUntil(this.cancelPreviousSearchRequest$),
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        this.resources = this.resources.concat((response as ReadResourceSequence).resources);
        this.nextPageNumber += 1;
        this._cd.markForCheck();
      });
  }

  private _getRestrictToResourceClass(resource: ReadResource) {
    const linkType = resource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
    return resource.entityInfo.properties[linkType].objectType;
  }

  private _initAutocompleteScroll() {
    this.matAutocompleteOptionsScrollDirective = new MatAutocompleteOptionsScrollDirective(this.auto);
    this.matAutocompleteOptionsScrollDirective.scrollEvent
      .pipe(
        filter(() => {
          return !this.loading && this.searchResultCount > this.resources.length;
        }),
        takeUntil(this.destroyed$),
        map(() => {
          this.loading = true;
          this._cd.markForCheck();
        }),
        debounceTime(300)
      )
      .subscribe(() => this._search(this._getTextInput(), this.nextPageNumber));
  }

  private _getResourceProperties() {
    const ontologyIri = this.resourceClassIri.split('#')[0];
    this.loading = true;
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(this.resourceClassIri)))
      .subscribe(onto => {
        const readResource = new ReadResource();
        readResource.entityInfo = onto;

        this._linkValueDataService.onInit(ontologyIri, readResource, this.propIri);
        this.readResource = readResource;
        this.useDefaultValue = false;
        this.loading = false;
        this._cd.markForCheck();
      });
  }

  private _getTextInput() {
    return this.input.nativeElement.value;
  }
}
