import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  ApiResponseError,
  CardinalityUtil,
  Constants,
  CountQueryResponse,
  DeleteValue,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  PermissionUtil,
  PropertyDefinition,
  ReadLinkValue,
  ReadProject,
  ReadResource,
  ReadResourceSequence,
  ReadTextValueAsXml,
  ReadUser,
  ReadValue,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable, Subject, Subscription, forkJoin } from 'rxjs';
import { DspResource } from '../dsp-resource';
import { RepresentationConstants } from '../representation/file-representation';
import { IncomingService } from '../services/incoming.service';
import { ResourceService } from '../services/resource.service';
import {
  AddedEventValue,
  DeletedEventValue,
  Events,
  UpdatedEventValues,
  ValueOperationEventService,
} from '../services/value-operation-event.service';
import { ValueService } from '../services/value.service';

// object of property information from ontology class, properties and property values
export interface PropertyInfoValues {
  guiDef: IHasPropertyWithPropertyDefinition;
  propDef: PropertyDefinition;
  values: ReadValue[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
})
export class PropertiesComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  /**
   * input `resource` of properties component:
   * complete information about the current resource
   */
  @Input() resource: DspResource;

  /**
   * does the logged-in user has system or project admin permissions?
   */
  @Input() adminPermissions = false;

  /**
   * in case properties belongs to an annotation (e.g. region in still images)
   * in this case we don't have to display the isRegionOf property
   */
  @Input() isAnnotation = false;

  @Input() showResourceToolbar = false;

  @Input() valueUuidToHighlight: string;

  @Input() attachedUser: ReadUser;
  @Input() attachedProject: ReadProject;

  /**
   * output `referredProjectClicked` of resource view component:
   * can be used to go to project page
   */
  @Output() referredProjectClicked: EventEmitter<ReadProject> = new EventEmitter<ReadProject>();

  /**
   * output `referredProjectHovered` of resource view component:
   * can be used for preview when hovering on project
   */
  @Output() referredProjectHovered: EventEmitter<ReadProject> = new EventEmitter<ReadProject>();

  /**
   * output `referredResourceClicked` of resource view component:
   * can be used to open resource
   */
  @Output() referredResourceClicked: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

  /**
   * output `referredResourceHovered` of resource view component:
   * can be used for preview when hovering on resource
   */
  @Output() referredResourceHovered: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

  @Output() regionChanged: EventEmitter<ReadValue> = new EventEmitter<ReadValue>();

  @Output() regionDeleted: EventEmitter<void> = new EventEmitter<void>();

  readonly amount_resources = 25;

  @Input() lastModificationDate: string;

  userCanDelete: boolean;
  cantDeleteReason = '';

  userCanEdit: boolean;
  addValueFormIsVisible: boolean; // used to toggle add value form field
  propID: string; // used in template to show only the add value form of the corresponding value

  valueOperationEventSubscriptions: Subscription[] = []; // array of ValueOperationEvent subscriptions

  representationConstants = RepresentationConstants;

  numberOffAllIncomingLinkRes: number;
  allIncomingLinkResources: ReadResource[] = [];
  displayedIncomingLinkResources: ReadResource[] = [];
  hasIncomingLinkIri = Constants.HasIncomingLinkValue;
  pageEvent: PageEvent;
  loading = false;

  @Select(ResourceSelectors.showAllProps) showAllProps$: Observable<boolean>;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _resourceService: ResourceService,
    private _valueOperationEventService: ValueOperationEventService,
    private _valueService: ValueService,
    private _sortingService: SortingService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // reset the page event
    this.pageEvent = new PageEvent();
    this.pageEvent.pageIndex = 0;

    this._getAllIncomingLinkRes();

    if (this.resource.res) {
      // get user permissions
      const allPermissions = PermissionUtil.allUserPermissions(
        this.resource.res.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR'
      );

      // get last modification date
      this.lastModificationDate = this.resource.res.lastModificationDate;

      // if user has modify permissions, set addButtonIsVisible to true so the user see's the add button
      this.userCanEdit = allPermissions.indexOf(PermissionUtil.Permissions.M) !== -1;

      // if user has delete permissions
      this.userCanDelete = allPermissions.indexOf(PermissionUtil.Permissions.D) !== -1;
    }

    // listen for the AddValue event to be emitted and call hideAddValueForm()
    // this._valueOperationEventService.on(Events.ValueAdded, () => this.hideAddValueForm())
    this.valueOperationEventSubscriptions = [];

    // subscribe to the ValueOperationEventService and listen for an event to be emitted
    this.valueOperationEventSubscriptions.push(
      this._valueOperationEventService.on(Events.ValueAdded, (newValue: AddedEventValue) => {
        if (newValue) {
          this.lastModificationDate = newValue.addedValue.valueCreationDate;
          this.addValueToResource(newValue.addedValue);
          this.hideAddValueForm();
        }
      })
    );

    this.valueOperationEventSubscriptions.push(
      this._valueOperationEventService.on(Events.ValueUpdated, (updatedValue: UpdatedEventValues) => {
        this.lastModificationDate = updatedValue.updatedValue.valueCreationDate;
        this.updateValueInResource(updatedValue.currentValue, updatedValue.updatedValue);
        this.hideAddValueForm();
      })
    );

    this.valueOperationEventSubscriptions.push(
      this._valueOperationEventService.on(Events.ValueDeleted, (deletedValue: DeletedEventValue) => {
        // the DeletedEventValue does not contain a creation or last modification date
        // so, we have to grab it from res info
        this._getLastModificationDate(this.resource.res.id);
        this.deleteValueFromResource(deletedValue.deletedValue);
      })
    );
  }

  ngOnChanges(): void {
    this._getAllIncomingLinkRes();
  }

  ngOnDestroy() {
    // unsubscribe from the ValueOperationEventService when component is destroyed
    if (this.valueOperationEventSubscriptions !== undefined) {
      this.valueOperationEventSubscriptions.forEach(sub => sub.unsubscribe());
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  trackByFn = (index: number, item: ReadResource) => `${index}-${item.id}`;
  trackByValuesFn = (index: number, item: any) => `${index}-${item}`;
  trackByPropertyInfoFn = (index: number, item: PropertyInfoValues) => `${index}-${item.propDef.id}`;

  /**
   * goes to the next page of the incoming link pagination
   * @param page
   */
  goToPage(page: PageEvent) {
    this.pageEvent = page;
    this._getDisplayedIncomingLinkRes();
  }

  handleIncomingLinkForward() {
    if (this.allIncomingLinkResources.length / this.amount_resources > this.pageEvent.pageIndex + 1) {
      const newPage = new PageEvent();
      newPage.pageIndex = this.pageEvent.pageIndex + 1;
      this.goToPage(newPage);
    }
  }

  handleIncomingLinkBackward() {
    if (this.pageEvent.pageIndex > 0) {
      const newPage = new PageEvent();
      newPage.pageIndex = this.pageEvent.pageIndex - 1;
      this.goToPage(newPage);
    }
  }

  /**
   * opens resource
   * @param linkValue
   */
  openResource(linkValue: ReadLinkValue | string) {
    const iri = typeof linkValue == 'string' ? linkValue : linkValue.linkedResourceIri;
    const path = this._resourceService.getResourcePath(iri);
    window.open(`/resource${path}`, '_blank');
  }

  previewResource() {
    // --> TODO: pop up resource preview on hover
  }

  /**
   * called from the template when the user clicks on the add button
   */
  showAddValueForm(prop: PropertyInfoValues, ev: Event) {
    ev.preventDefault();
    this.propID = prop.propDef.id;
    this.addValueFormIsVisible = true;
  }

  /**
   * called from the template when the user clicks on the cancel button
   */
  hideAddValueForm() {
    this.addValueFormIsVisible = false;
    this.propID = undefined;
  }

  /**
   * given a resource property, check if an add button should be displayed under the property values
   *
   * @param prop the resource property
   */
  addValueIsAllowed(prop: PropertyInfoValues): boolean {
    // if the ontology flags this as a read-only property,
    // don't ever allow to add a value
    if (prop.propDef instanceof ResourcePropertyDefinition && !prop.propDef.isEditable) {
      return false;
    }

    const isAllowed = CardinalityUtil.createValueForPropertyAllowed(
      prop.propDef.id,
      prop.values.length,
      this.resource.res.entityInfo.classes[this.resource.res.type]
    );

    // check if:
    // cardinality allows for a value to be added
    // value component does not already have an add value form open
    // user has write permissions
    return isAllowed && this.propID !== prop.propDef.id && this.userCanEdit;
  }

  /**
   * updates the UI in the event of a new value being added to show the new value
   *
   * @param valueToAdd the value to add to the end of the values array of the filtered property
   */
  addValueToResource(valueToAdd: ReadValue): void {
    if (!valueToAdd.id.includes(this.resource.res.id)) {
      return;
    }

    if (this.resource.resProps) {
      this.resource.resProps
        .filter(propInfoValueArray => propInfoValueArray.propDef.id === valueToAdd.property) // filter to the correct property
        .forEach(propInfoValue => {
          propInfoValue.values.push(valueToAdd); // push new value to array
        });

      if (valueToAdd instanceof ReadTextValueAsXml) {
        this._updateStandoffLinkValue();
      }
    } else {
      // --> TODO: better error handler!
      console.warn('No properties exist for this resource');
    }
  }

  /**
   * updates the UI in the event of an existing value being updated to show the updated value
   *
   * @param valueToReplace the value to be replaced within the values array of the filtered property
   * @param updatedValue the value to replace valueToReplace with
   */
  updateValueInResource(valueToReplace: ReadValue, updatedValue: ReadValue): void {
    if (this.resource.resProps && updatedValue !== null) {
      this.resource.resProps
        .filter(propInfoValueArray => propInfoValueArray.propDef.id === valueToReplace.property) // filter to the correct property
        .forEach(filteredpropInfoValueArray => {
          filteredpropInfoValueArray.values.forEach((val, index) => {
            // loop through each value of the current property
            if (val.id === valueToReplace.id) {
              // find the value that should be updated using the id of valueToReplace
              filteredpropInfoValueArray.values[index] = updatedValue; // replace value with the updated value
            }
          });
        });
      if (updatedValue instanceof ReadTextValueAsXml) {
        this._updateStandoffLinkValue();
      }
      // if annotations tab is active;
      if (this.isAnnotation) {
        this.regionChanged.emit();
      }
    } else {
      console.warn('No properties exist for this resource');
    }
  }

  /**
   * given a resource property, check if its cardinality allows a value to be deleted
   *
   * @param prop the resource property
   */
  deleteValueIsAllowed(prop: PropertyInfoValues): boolean {
    const card = CardinalityUtil.deleteValueForPropertyAllowed(
      prop.propDef.id,
      prop.values.length,
      this.resource.res.entityInfo.classes[this.resource.res.type]
    );
    if (!card) {
      this.cantDeleteReason = 'This value can not be deleted because it is required.';
    }

    if (!this.userCanDelete) {
      this.cantDeleteReason = 'You do not have teh permission to delete this value.';
    }

    return card && this.userCanDelete;
  }

  /**
   * updates the UI in the event of an existing value being deleted
   *
   * @param valueToDelete the value to remove from the values array of the filtered property
   */
  deleteValueFromResource(valueToDelete: DeleteValue): void {
    if (this.resource.resProps) {
      this.resource.resProps
        .filter(
          (
            propInfoValueArray // filter to the correct type
          ) =>
            this._valueService.compareObjectTypeWithValueType(propInfoValueArray.propDef.objectType, valueToDelete.type)
        )
        .forEach(filteredpropInfoValueArray => {
          filteredpropInfoValueArray.values.forEach((val, index) => {
            // loop through each value of the current property
            if (val.id === valueToDelete.id) {
              // find the value that was deleted using the id
              filteredpropInfoValueArray.values.splice(index, 1); // remove the value from the values array

              if (val instanceof ReadTextValueAsXml) {
                this._updateStandoffLinkValue();
              }
            }
          });
        });
    } else {
      console.warn('No properties exist for this resource');
    }
  }

  /**
   * gets the number of incoming links and gets the incoming links.
   * @private
   */
  private _getAllIncomingLinkRes() {
    if (this.pageEvent) {
      this.loading = true;
      this._incomingService.getIncomingLinks(this.resource.res.id, 0, true).subscribe(
        (response: CountQueryResponse) => {
          this.numberOffAllIncomingLinkRes = response.numberOfResults;
          const round =
            this.numberOffAllIncomingLinkRes > this.amount_resources
              ? Math.ceil(this.numberOffAllIncomingLinkRes / this.amount_resources)
              : 1;

          const arr = new Array<Observable<ReadResourceSequence | CountQueryResponse | ApiResponseError>>(round);

          for (let i = 0; i < round; i++) {
            arr[i] = this._incomingService.getIncomingLinks(this.resource.res.id, i);
          }

          forkJoin(arr).subscribe(
            (data: ReadResourceSequence[]) => {
              const flattenIncomingRes = data.flatMap(a => a.resources);
              this.allIncomingLinkResources = this._sortingService.keySortByAlphabetical(
                flattenIncomingRes,
                'resourceClassLabel',
                'label'
              );

              this._getDisplayedIncomingLinkRes();
              this.loading = false;
              this._cd.markForCheck();
            },
            () => {
              this.loading = false;
            }
          );
        },
        () => {
          this.loading = false;
        }
      );
    }
  }

  private _getDisplayedIncomingLinkRes() {
    const startIndex = this.pageEvent.pageIndex * this.amount_resources;
    this.displayedIncomingLinkResources = this.allIncomingLinkResources.slice(
      startIndex,
      startIndex + this.amount_resources
    );
  }

  /**
   * updates the standoff link value for the resource being displayed.
   *
   */
  private _updateStandoffLinkValue(): void {
    if (this.resource.res === undefined) {
      // this should never happen:
      // if the user was able to click on a standoff link,
      // then the resource must have been initialised before.
      return;
    }

    const gravsearchQuery = `
     PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
     CONSTRUCT {
         ?res knora-api:isMainResource true .
         ?res knora-api:hasStandoffLinkTo ?target .
     } WHERE {
         BIND(<${this.resource.res.id}> as ?res) .
         OPTIONAL {
             ?res knora-api:hasStandoffLinkTo ?target .
         }
     }
     OFFSET 0
     `;

    this._dspApiConnection.v2.search.doExtendedSearch(gravsearchQuery).subscribe(
      (res: ReadResourceSequence) => {
        // one resource is expected
        if (res.resources.length !== 1) {
          return;
        }

        const newStandoffLinkVals = res.resources[0].getValuesAs(Constants.HasStandoffLinkToValue, ReadLinkValue);

        this.resource.resProps
          .filter(resPropInfoVal => resPropInfoVal.propDef.id === Constants.HasStandoffLinkToValue)
          .forEach(standoffLinkResPropInfoVal => {
            // delete all the existing standoff link values
            standoffLinkResPropInfoVal.values = [];
            // push standoff link values retrieved for the resource
            newStandoffLinkVals.forEach(standoffLinkVal => {
              standoffLinkResPropInfoVal.values.push(standoffLinkVal);
            });
          });
        this._cd.markForCheck();
      },
      err => {
        console.error(err);
      }
    );
  }

  private _getLastModificationDate(resId: string) {
    this._dspApiConnection.v2.res.getResource(resId).subscribe((res: ReadResource) => {
      this.lastModificationDate = res.lastModificationDate;
      this._cd.markForCheck();
    });
  }
}
