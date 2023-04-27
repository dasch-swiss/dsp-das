import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { inject } from "@angular/core";
import { KnoraApiConnection, ReadUser } from "@dasch-swiss/dsp-js";

@Injectable()
export class ProfileService {

  private _dspApiConnection: KnoraApiConnection = inject(KnoraApiConnection)

  /**
   * Suspend a user. This method does not actually delete a user, but sets the status to false.
   * The user cannot unsuspend him/her self afterward.
   *
   * @param id The IRI of the user to be suspended.
   */
  suspendUser(id: string): Observable<ReadUser> {
    return this._dspApiConnection.admin.usersEndpoint.deleteUser(id).pipe(

    );
  }

}
