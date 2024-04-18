import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import {
  KnoraApiConnection,
  ReadProject,
  ReadResource,
  ReadResourceSequence,
  ResourceClassAndPropertyDefinitions,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { CreateResourceDialogComponent, CreateResourceDialogProps } from '@dasch-swiss/vre/shared/app-resource-form';
import { ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/temp-link-value.service';
import { Store } from '@ngxs/store';
import { of, Subscription } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
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
        (input)="search()"
        [matAutocomplete]="auto" />
      <mat-autocomplete
        #auto="matAutocomplete"
        requireSelection
        [displayWith]="displayResource.bind(this)"
        (closed)="onClose()">
        <mat-option *ngIf="resources.length === 0" [disabled]="true"> No results were found.</mat-option>
        <mat-option
          *ngFor="let rc of _linkValueDataService.resourceClasses"
          (click)="openCreateResourceDialog($event, rc.id, rc.label)">
          Create New: {{ rc?.label }}
        </mat-option>
        <mat-option *ngFor="let res of resources" [value]="res.id"> {{ res.label }}</mat-option>
      </mat-autocomplete>
      <mat-hint>{{ 'appLabels.form.action.searchHelp' | translate }}</mat-hint>
      <mat-error *ngIf="control.errors as errors">{{ errors | humanReadableError }}</mat-error>
    </mat-form-field>
  `,
  providers: [LinkValueDataService],
})
export class LinkValueComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control: FormControl<string>;
  @Input() propIri: string;
  @Input({ required: true }) resourceClassIri!: string;

  @ViewChild(MatAutocompleteTrigger) autoComplete: MatAutocompleteTrigger;
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  resources: ReadResource[] = [];

  readResource: ReadResource | undefined;
  subscription: Subscription | undefined;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _tempLinkValueService: TempLinkValueService,
    private _dialog: MatDialog,
    private _cd: ChangeDetectorRef,
    public _linkValueDataService: LinkValueDataService,
    private _store: Store
  ) {}

  ngOnInit() {
    this._getResourceProperties();
  }

  onClose() {
    console.log('on close');
    const text = this.input.nativeElement.value.toLowerCase();
    if (text !== this.displayResource(this.control.value)) {
      this.input.nativeElement.value = '';
    }
  }

  search() {
    const text = this.input.nativeElement.value.toLowerCase();
    const readResource = this.readResource as ReadResource;
    this.subscription = of(text)
      .pipe(
        tap(v => console.log('value changes', v)),
        filter(searchTerm => searchTerm?.length >= 3),
        switchMap((searchTerm: string) =>
          this._dspApiConnection.v2.search.doSearchByLabel(searchTerm, 0, {
            limitToResourceClass: this._getRestrictToResourceClass(readResource),
          })
        )
      )
      .subscribe((response: ReadResourceSequence) => {
        this.resources = response.resources;
        this._cd.detectChanges();
      });
  }

  openCreateResourceDialog(event: any, resourceClassIri: string, resourceType: string) {
    let myResourceId: string;

    event.stopPropagation();
    const projectIri = (this._store.selectSnapshot(ProjectsSelectors.currentProject) as ReadProject).id;
    this._dialog
      .open<CreateResourceDialogComponent, CreateResourceDialogProps, string>(CreateResourceDialogComponent, {
        data: {
          resourceType,
          resourceClassIri,
          projectIri,
        },
      })
      .afterClosed()
      .pipe(
        switchMap(resourceId => {
          myResourceId = resourceId as string;
          return this._dspApiConnection.v2.res.getResource(myResourceId);
        })
      )
      .subscribe((res: ReadResource) => {
        this.resources.push(res);
        this.control.setValue(myResourceId);
        this.autoComplete.closePanel();
        this._cd.detectChanges();
      });
  }

  private _getRestrictToResourceClass(resource: ReadResource) {
    const linkType = resource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
    return resource.entityInfo.properties[linkType].objectType;
  }

  displayResource(resId: string | null): string {
    if (!this.resources || resId === null) return '';
    return this.resources.find(res => res.id === resId)?.label ?? '';
  }

  private _getResourceProperties() {
    const ontologyIri = this.resourceClassIri.split('#')[0];
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(this.resourceClassIri)))
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        const readResource = new ReadResource();
        readResource.entityInfo = onto;

        this._linkValueDataService.onInit(ontologyIri, readResource, this.propIri);
        this.readResource = readResource;
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
