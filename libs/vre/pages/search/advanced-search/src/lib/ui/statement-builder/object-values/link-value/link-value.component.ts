import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteOptionsScrollDirective } from '@dasch-swiss/vre/shared/app-common';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { IriLabelPair } from '../../../../model';
import { DynamicFormsDataService } from '../../../../service/dynamic-forms-data.service';

@Component({
  selector: 'app-link-value',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatAutocompleteOptionsScrollDirective,
    AppProgressIndicatorComponent,
  ],
  template: `
    <mat-form-field>
      <input
        matInput
        placeholder="Search for a resource"
        aria-label="Search for a resource by name"
        [matAutocomplete]="auto"
        [formControl]="inputControl" />
      <mat-autocomplete
        #autoComplete
        #auto="matAutocomplete"
        [displayWith]="displayLabel"
        (optionsScroll)="onScroll()"
        (optionSelected)="onResourceSelected($event)">
        @let linkObjects = linkValueObjects$ | async;
        @let loading = loading$ | async;
        @let lastSearch = lastSearchString$ | async;

        @if (!linkObjects?.length && !loading) {
          @if (lastSearch && lastSearch.length > 2) {
            <mat-option [disabled]="true">No resources found for "{{ lastSearch }}"</mat-option>
          } @else {
            <mat-option [disabled]="true">Type at least 3 characters to search</mat-option>
          }
        }
        @if (linkObjects?.length && !loading) {
          <mat-option [disabled]="true"> {{ linkObjects.length }} results found </mat-option>
        }
        @for (obj of linkObjects; track obj.iri ?? obj) {
          <mat-option [value]="obj">{{ obj?.label }}</mat-option>
        }
        @if (loading) {
          <mat-option class="loader" [disabled]="true">
            <div class="loading-container">
              <app-progress-indicator />
              <span class="loading-text">Loading resources...</span>
            </div>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkValueComponent implements OnInit, AfterViewInit, OnDestroy {
  private _dataService = inject(DynamicFormsDataService);
  private destroy$ = new Subject<void>();

  @Input() resourceClass?: string;
  @Input() selectedResource?: IriLabelPair;

  @Output() emitResourceSelected = new EventEmitter<IriLabelPair>();

  linkValueObjects$ = new BehaviorSubject<IriLabelPair[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  lastSearchString$ = new BehaviorSubject<string | null>(null);

  inputControl = new FormControl<string | null>(null);

  ngOnInit() {
    if (!this.resourceClass) {
      return;
    }

    this.inputControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(searchString => this.lastSearchString$.next(searchString)),
        filter(searchString => searchString !== null && searchString.length > 2),
        tap(() => this.loading$.next(true)),
        switchMap(searchString =>
          this._dataService.searchResourcesByLabel$(searchString!, this.resourceClass!, 0).pipe(
            catchError(error => {
              console.error('LinkValue search error:', error);
              return of([]);
            })
          )
        ),
        tap(() => this.loading$.next(false)),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.linkValueObjects$.next(results);
      });
  }

  ngAfterViewInit(): void {
    if (this.selectedResource) {
      this.inputControl.setValue(this.selectedResource.label, { emitEvent: false });
    }
  }

  onResourceSelected(event: MatAutocompleteSelectedEvent) {
    const data = event.option.value as IriLabelPair;
    // Set the label in the input (string only)
    this.inputControl.setValue(data.label, { emitEvent: false });
    // Emit the full object to parent
    this.emitResourceSelected.emit(data);
  }

  onScroll() {
    const lastSearch = this.lastSearchString$.value;
    const currentLoading = this.loading$.value;
    const currentResults = this.linkValueObjects$.value;

    if (currentLoading || !lastSearch || lastSearch.length <= 2 || currentResults.length < 25) {
      return;
    }

    this.loading$.next(true);
    const offset = Math.ceil(currentResults.length / 25) - 1;

    this._dataService
      .searchResourcesByLabel$(lastSearch, this.resourceClass!, offset)
      .pipe(
        take(1),
        finalize(() => this.loading$.next(false))
      )
      .subscribe(results => {
        this.linkValueObjects$.next([...currentResults, ...results]);
      });
  }

  /**
   * Display function for MatAutocomplete to show the label.
   * Since we store only strings in FormControl, this just returns the value.
   */
  displayLabel = (value: string | null): string => value ?? '';

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loading$.complete();
    this.linkValueObjects$.complete();
    this.lastSearchString$.complete();
  }
}
