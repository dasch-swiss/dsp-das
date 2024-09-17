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
} from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { FilteredResources, ShortResInfo } from '@dasch-swiss/vre/shared/app-common-to-move';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-link-form',
  templateUrl: './resource-link-form.component.html',
})
export class ResourceLinkFormComponent implements OnDestroy {
  @Input({ required: true }) resources!: FilteredResources;
  @Input({ required: true }) project!: string;
  @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

  form = this._fb.group({
    label: ['', Validators.required],
    comment: ['', Validators.required],
  });

  private ngUnsubscribe = new Subject<void>();

  @Select(UserSelectors.isSysAdmin) isSysAdmin$!: Observable<boolean>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isCurrentProjectAdminOrSysAdmin$!: Observable<boolean>;
  @Select(ProjectsSelectors.isProjectsLoading) isLoading$!: Observable<boolean>;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: FormBuilder,
    private _resourceService: ResourceService,
    private _router: Router
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
    linkObj.attachedToProject = this.project;

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
