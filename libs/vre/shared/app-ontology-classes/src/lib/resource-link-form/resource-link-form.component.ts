import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Constants,
  CreateLinkValue,
  CreateResource,
  CreateTextValueAsString,
  CreateValue,
  KnoraApiConnection,
  ReadResource,
  StoredProject,
} from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { FilteredResources, ShortResInfo } from '@dasch-swiss/vre/shared/app-common-to-move';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-link-form',
  templateUrl: './resource-link-form.component.html',
})
export class ResourceLinkFormComponent implements OnDestroy {
  @Input({ required: true }) resources!: FilteredResources;
  @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

  form = this._fb.group({
    label: ['', Validators.required],
    comment: ['', Validators.required],
    project: ['', Validators.required],
  });

  private ngUnsubscribe = new Subject<void>();

  usersProjects$: Observable<StoredProject[]> = combineLatest([
    this._store.select(ProjectsSelectors.currentProject),
    this._store.select(UserSelectors.userProjects),
    this._store.select(UserSelectors.isSysAdmin),
  ]).pipe(
    takeUntil(this.ngUnsubscribe),
    map(([currentProject, currentUserProjects, isSysAdmin]) => {
      console.log('julilen', currentProject, currentUserProjects, isSysAdmin);
      let projects: any;
      if (isSysAdmin) {
        projects = currentProject ? [currentProject] : currentUserProjects;
      } else {
        projects = currentProject ? currentUserProjects.find(x => x.id === currentProject.id) : currentUserProjects;
      }
      return projects as StoredProject[];
    })
  );

  @Select(UserSelectors.isSysAdmin) isSysAdmin$!: Observable<boolean>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isCurrentProjectAdminOrSysAdmin$!: Observable<boolean>;
  @Select(ProjectsSelectors.isProjectsLoading) isLoading$!: Observable<boolean>;
  @Select(ProjectsSelectors.hasLoadingErrors) hasLoadingErrors$!: Observable<boolean>;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: FormBuilder,
    private _resourceService: ResourceService,
    private _router: Router,
    private _store: Store
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  trackByFn = (index: number, item: ShortResInfo) => `${index}-${item.id}`;

  submitData() {
    const linkObj = new CreateResource();

    linkObj.label = this.form.controls.label.value!;
    linkObj.type = Constants.LinkObj;
    linkObj.attachedToProject = this.form.controls.project.value!;

    const hasLinkToValue: CreateValue[] = [];

    this.resources.resInfo.forEach(res => {
      const linkVal = new CreateLinkValue();
      linkVal.type = Constants.LinkValue;
      linkVal.linkedResourceIri = res.id;
      hasLinkToValue.push(linkVal);
    });

    const comment = this.form.controls.comment.value;
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
