import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { Group } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { LoadProjectMembershipAction } from '@dasch-swiss/vre/core/state';
import { AutocompleteItem } from '@dasch-swiss/vre/pages/user-settings/user';
import { Store } from '@ngxs/store';
import { filter, from, merge, mergeMap, take, takeLast } from 'rxjs';

@Component({
  selector: 'app-select-group',
  template: `
    <mat-form-field *ngIf="groups.length > 0">
      <mat-select placeholder="Permission group" [formControl]="groupCtrl" multiple (selectionChange)="onGroupChange()">
        <mat-option *ngFor="let group of groups; trackBy: trackByFn" [value]="group.id" [disabled]="disabled">
          {{ group.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <div *ngIf="groups.length === 0" class="center">No group defined yet.</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGroupComponent implements AfterViewInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) user!: ReadUser;
  @Input({ required: true }) disabled!: boolean;
  @Input({ required: true }) permissions: any;
  @Input({ required: true }) groups!: Group[];

  groupCtrl = new UntypedFormControl();

  ngAfterViewInit() {
    setTimeout(() => {
      this.groupCtrl.setValue(this.permissions);
    });
  }

  trackByFn = (index: number, item: AutocompleteItem) => `${index}-${item.label}`;

  constructor(
    private _userApiService: UserApiService,
    private _store: Store
  ) {}

  onGroupChange() {
    if (!this.groupCtrl.value) {
      return;
    }

    if (this._sort(this.permissions, this.groupCtrl.value)) {
      this.permissions = this.groupCtrl.value;
      this._updateGroupsMembership(this.user.id, this.groupCtrl.value);
    }
  }

  private _sort(arrOne: string[], arrTwo: string[]): boolean {
    return [...arrOne].sort().join(',') !== [...arrTwo].sort().join(',');
  }

  private _updateGroupsMembership(userIri: string, groups: string[]): void {
    if (!groups) {
      return;
    }

    const currentUserGroups: string[] = [];
    this._userApiService.getGroupMembershipsForUser(userIri).subscribe(response => {
      for (const group of response.groups) {
        currentUserGroups.push(group.id);
      }

      const removeOldGroup$ = from(currentUserGroups).pipe(
        filter(oldGroup => groups.indexOf(oldGroup) === -1), // Filter out groups that are no longer in 'groups'
        mergeMap(oldGroup => this._userApiService.removeFromGroupMembership(userIri, oldGroup).pipe(take(1)))
      );

      const addNewGroup$ = from(groups).pipe(
        filter(newGroup => currentUserGroups.indexOf(newGroup) === -1), // Filter out groups that are already in 'currentUserGroups'
        mergeMap(newGroup => this._userApiService.addToGroupMembership(userIri, newGroup).pipe(take(1)))
      );

      merge(removeOldGroup$, addNewGroup$)
        .pipe(takeLast(1))
        .subscribe(() => {
          if (this.projectId) {
            this._store.dispatch(new LoadProjectMembershipAction(this.projectId));
          }
        });
    });
  }
}
