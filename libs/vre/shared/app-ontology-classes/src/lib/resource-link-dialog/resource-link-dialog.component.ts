import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Constants,
  CreateLinkValue,
  CreateResource,
  CreateTextValueAsString,
  KnoraApiConnection,
  ReadResource,
  StoredProject,
} from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { FilteredResources, ShortResInfo } from '@dasch-swiss/vre/shared/app-common-to-move';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-link-dialog',
  templateUrl: './resource-link-dialog.component.html',
  styleUrls: ['./resource-link-dialog.component.scss'],
})
export class ResourceLinkDialogComponent implements OnDestroy {
  private _ngUnsubscribe = new Subject<void>();

  @Input() resources: FilteredResources;

  @Output() closeDialog = new EventEmitter<any>();

  /**
   * form group, errors and validation messages
   */
  form = this._fb.group({
    label: ['', [Validators.required]],
    comment: [''],
  });

  selectedProject: string;

  usersProjects$: Observable<StoredProject[]> = combineLatest([
    this._store.select(ProjectsSelectors.currentProject),
    this._store.select(UserSelectors.userProjects),
    this._store.select(UserSelectors.isSysAdmin),
  ]).pipe(
    takeUntil(this._ngUnsubscribe),
    map(([currentProject, currentUserProjects, isSysAdmin]) => {
      const projects = currentProject
        ? isSysAdmin
          ? [currentProject]
          : currentUserProjects.find(x => x.id === currentProject.id)
        : currentUserProjects;
      return projects as StoredProject[];
    })
  );

  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);
  isCurrentProjectAdminOrSysAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  isLoading$ = this._store.select(ProjectsSelectors.isProjectsLoading);
  hasLoadingErrors$ = this._store.select(ProjectsSelectors.hasLoadingErrors);

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: UntypedFormBuilder,
    private _resourceService: ResourceService,
    private _router: Router,
    private _store: Store
  ) {}

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  trackByFn = (index: number, item: ShortResInfo) => `${index}-${item.id}`;

  submitData() {
    // build link resource as type CreateResource
    const linkObj = new CreateResource();

    linkObj.label = this.form.controls['label'].value;

    linkObj.type = Constants.LinkObj;

    linkObj.attachedToProject = this.selectedProject;

    const hasLinkToValue = [];

    this.resources.resInfo.forEach(res => {
      const linkVal = new CreateLinkValue();
      linkVal.type = Constants.LinkValue;
      linkVal.linkedResourceIri = res.id;
      hasLinkToValue.push(linkVal);
    });

    const comment = this.form.controls['comment'].value;
    if (comment) {
      const commentVal = new CreateTextValueAsString();
      commentVal.type = Constants.TextValue;
      commentVal.text = comment;
      linkObj.properties = {
        [Constants.HasLinkToValue]: hasLinkToValue,
        [Constants.HasComment]: [commentVal],
      };
    } else {
      linkObj.properties = {
        [Constants.HasLinkToValue]: hasLinkToValue,
      };
    }

    this._dspApiConnection.v2.res.createResource(linkObj).subscribe((res: ReadResource) => {
      const path = this._resourceService.getResourcePath(res.id);
      const goto = `/resource${path}`;
      this._router.navigate([]).then(() => window.open(goto, '_blank'));
      this.closeDialog.emit();
    });
  }
}
