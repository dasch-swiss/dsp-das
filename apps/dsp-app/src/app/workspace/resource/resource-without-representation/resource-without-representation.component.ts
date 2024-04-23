import { Component, Input, OnDestroy } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-without-representation',
  templateUrl: './resource-without-representation.component.html',
  styleUrls: ['./resource-without-representation.component.scss'],
})
export class ResourceWithoutRepresentationComponent implements OnDestroy {
  @Input() resource: DspResource;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  get isAdmin$(): Observable<boolean> {
    return combineLatest([this.user$, this.userProjectAdminGroups$]).pipe(
      takeUntil(this.ngUnsubscribe),
      map(([user, userProjectGroups]) => {
        return this.resource.attachedToProject
          ? ProjectService.IsProjectAdminOrSysAdmin(user, userProjectGroups, this.resource.attachedToProject)
          : false;
      })
    );
  }

  @Select(UserSelectors.user) user$: Observable<ReadUser>;
  @Select(UserSelectors.userProjectAdminGroups)
  userProjectAdminGroups$: Observable<string[]>;

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
