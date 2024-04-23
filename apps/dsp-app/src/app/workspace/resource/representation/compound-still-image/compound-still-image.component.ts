import { Component, Input, OnDestroy } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { CompoundNavigationService } from '@dsp-app/src/app/workspace/resource/representation/still-image_/compound-navigation.service';
import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-compound-still-image',
  templateUrl: './compound-still-image.component.html',
  styleUrls: ['./compound-still-image.component.scss'],
})
export class CompoundStillImageComponent implements OnDestroy {
  @Input() resource: DspResource;
  @Input() totalPages$: Observable<number>;

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

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Select(UserSelectors.user) user$: Observable<ReadUser>;
  @Select(UserSelectors.userProjectAdminGroups)
  private userProjectAdminGroups$: Observable<string[]>;

  constructor(private _compoundNav: CompoundNavigationService) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
