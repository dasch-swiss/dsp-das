import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteOptionsScrollDirective } from '@dasch-swiss/vre/shared/app-common';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { debounceTime, distinctUntilChanged, of, take } from 'rxjs';
import { ApiData, PropertyFormItem } from '../../../model';
import { PropertyFormManager } from '../../../service/property-form.manager';

@Component({
  selector: 'app-property-form-link-value',
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
  templateUrl: './property-form-link-value.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormLinkValueComponent implements OnInit, AfterViewInit {
  private _formsManager = inject(PropertyFormManager);

  @Input() objectType: string | undefined = undefined;
  @Input() value: string | PropertyFormItem[] | undefined = undefined;
  @Input() label: string | undefined = undefined;

  @Output() emitResourceSelected = new EventEmitter<ApiData>();

  // Get search-related data directly from service instead of prop-drilling
  resourcesSearchResultsLoading$ = of(true);
  resourcesSearchResultsCount$ = of(true);
  resourcesSearchResults$ = of(true);
  resourcesSearchNoResults$ = of(true);

  inputControl = new FormControl();

  ngOnInit() {
    this.inputControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      console.error('do sth with', { value, objectType: this.objectType });
      throw new Error('Method not implemented.');
    });
  }

  ngAfterViewInit(): void {
    if (this.value && typeof this.value === 'string' && this.label) {
      this.inputControl.setValue({ label: this.label, iri: this.value });
    }
  }

  onResourceSelected(event: MatAutocompleteSelectedEvent) {
    const data = event.option.value as ApiData;
    this.emitResourceSelected.emit(data);
  }

  onInputFocused() {
    if (this.objectType && this.inputControl.value) {
      console.error('do sth with', {
        value: this.inputControl.value,
        objectType: this.objectType,
      });
    }
    throw new Error('Method not implemented.');
  }

  onScroll() {
    // Check the observable value directly
    this.resourcesSearchResultsLoading$.pipe(take(1)).subscribe(loading => {
      if (!loading && this.objectType && this.inputControl.value) {
        this._formsManager.loadMoreResourcesSearchResults({
          value: this.inputControl.value,
          objectType: this.objectType,
        });
      }
    });
  }

  /**
   * used in the template to display the label of the selected resource
   * because the value we want to display is different than the value we want to emit
   *
   * @param resource the resource containing the label to be displayed (or no selection yet).
   */
  displayResource(resource: ApiData | null): string {
    // null is the initial value (no selection yet)
    if (resource !== null) {
      return resource.label;
    }
    return '';
  }
}
