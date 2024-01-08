import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CreateChildNodeRequest,
  ListInfoResponse,
  ListNode,
  ListNodeInfoResponse,
  StringLiteral,
} from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { ListItemService } from '@dsp-app/src/app/project/list/list-item/list-item.service';
import { atLeastOneStringRequired } from '@dsp-app/src/app/project/reusable-project-form/at-least-one-string-required.validator';

export class ListNodeOperation {
  operation: 'create' | 'insert' | 'update' | 'delete' | 'reposition';
  listNode: ListNode;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list-item-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="createChildNode()" style="display: flex">
      <dasch-swiss-multi-language-input
        style="flex: 1"
        [formGroup]="form"
        controlName="labels"
        [placeholder]="placeholder">
      </dasch-swiss-multi-language-input>
      <button color="primary" mat-icon-button matSuffix [disabled]="form.invalid" type="submit">
        <mat-icon> add</mat-icon>
      </button>
    </form>
  `,
})
export class ListItemFormComponent implements OnInit {
  @Input() projectUuid?: string;
  @Input() projectIri?: string;
  @Input() parentIri: string;

  loading = false;
  placeholder = 'Append item to ';
  form: FormGroup;

  constructor(
    private _listApiService: ListApiService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef,
    private _listItemService: ListItemService
  ) {}

  ngOnInit() {
    this._buildForms();

    this._listApiService.getNodeInfo(this.parentIri).subscribe(response => {
      if (response['listinfo']) {
        // root node
        this.placeholder += (response as ListInfoResponse).listinfo.labels[0].value;
      } else {
        // child node
        this.placeholder += (response as ListNodeInfoResponse).nodeinfo.labels[0].value;
      }

      this._cd.markForCheck();
    });
  }

  private _buildForms() {
    this.form = this._fb.group({
      labels: this._fb.array(
        [{ language: 'de', value: '' }].map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        ),
        atLeastOneStringRequired('value')
      ),
    });
  }

  createChildNode() {
    this.loading = true;

    // generate the data payload
    const childNode: CreateChildNodeRequest = new CreateChildNodeRequest();
    childNode.parentNodeIri = this.parentIri;
    childNode.projectIri = this.projectIri;
    childNode.name = `${this.projectUuid}-${Math.random().toString(36).substring(2)}${Math.random()
      .toString(36)
      .substring(2)}`;

    // initialize labels
    let i = 0;
    for (const l of this.form.value.labels) {
      childNode.labels[i] = new StringLiteral();
      childNode.labels[i].language = l.language;
      childNode.labels[i].value = l.value;
      i++;
    }
    this._listApiService.createChildNode(childNode.parentNodeIri, childNode).subscribe(response => {
      this.loading = false;
      this._listItemService.onUpdate$.next();
    });
  }

  resetForm() {
    this.form.reset();
    this._buildForms();
  }
}
