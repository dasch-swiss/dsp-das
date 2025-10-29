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
import { IriLabelPair } from '../../../../model';
import { PropertyFormManager } from '../../../../service/property-form.manager';

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
  templateUrl: './link-value.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkValueComponent implements OnInit, AfterViewInit {
  private _formsManager = inject(PropertyFormManager);

  @Input({ required: true }) resourceClass!: string;
  @Input() selectedResource?: IriLabelPair;

  @Output() emitResourceSelected = new EventEmitter<IriLabelPair>();

  // Get search-related data directly from service instead of prop-drilling
  resourcesSearchResultsLoading$ = of(true);
  resourcesSearchResultsCount$ = of(true);
  resourcesSearchResults$ = of(true);
  resourcesSearchNoResults$ = of(true);

  inputControl = new FormControl();

  ngOnInit() {
    this.inputControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      console.error('do sth with', { value, objectType: this.selectedResource });
      throw new Error('Method not implemented.');
    });
  }

  ngAfterViewInit(): void {
    if (this.selectedResource) {
      this.inputControl.setValue(this.selectedResource);
    }
  }

  onResourceSelected(event: MatAutocompleteSelectedEvent) {
    const data = event.option.value as IriLabelPair;
    this.emitResourceSelected.emit(data);
  }

  onInputFocused() {}

  onScroll() {
    // Check the observable value directly
    this.resourcesSearchResultsLoading$.pipe(take(1)).subscribe(loading => {
      if (!loading && this.inputControl.value) {
        this._formsManager.loadMoreResourcesSearchResults({
          value: this.inputControl.value,
          objectType: this.resourceClass,
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
  displayResource(resource: IriLabelPair | null): string {
    // null is the initial value (no selection yet)
    if (resource !== null) {
      return resource.label;
    }
    return '';
  }
}
