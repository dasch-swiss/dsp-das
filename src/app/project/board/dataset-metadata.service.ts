import { Injectable } from '@angular/core';
import { IId, Organization, Person } from '@dasch-swiss/dsp-js';

@Injectable({
  providedIn: 'root'
})
export class DatasetMetadataService {

  constructor() { }

  /**
  * used in project metadata page
  * determine if the object is of type Person or Organization or Iid
  * @param obj Person | Organization | IId
  */
  getContactType(obj: Person | Organization | IId): string {
    if (obj instanceof Person) {
      return 'person';
    }
    if (obj instanceof Organization) {
      return 'organization';
    }
    return undefined;
  }

}
