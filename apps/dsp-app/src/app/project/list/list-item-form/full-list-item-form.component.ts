import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListInfoResponse, ListNode, ListNodeInfoResponse } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { atLeastOneStringRequired } from '../../reusable-project-form/at-least-one-string-required.validator';
import { ListItemService } from '../list-item/list-item.service';

export class ListNodeOperation {
  operation: 'create' | 'insert' | 'update' | 'delete' | 'reposition';
  listNode: ListNode;
}

@Component({
  selector: 'app-full-list-item-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="createChildNode()" style="display: flex">
      <dasch-swiss-multi-language-input
        style="flex: 1"
        [formGroup]="form"
        controlName="labels"
        [placeholder]="placeholder">
      </dasch-swiss-multi-language-input>
      <dasch-swiss-multi-language-textarea
        [formGroup]="form"
        controlName="description"
        placeholder="TO DO"></dasch-swiss-multi-language-textarea>
    </form>
  `,
})
export class FullListItemFormComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() projectIri?: string;
  @Input() parentIri: string;

  placeholder: string;

  formData: { labels: { language: string; value: string }[]; descriptions: { language: string; value: string[] } };

  constructor(
    private _listApiService: ListApiService,
    private _fb: FormBuilder,
    private _listItemService: ListItemService
  ) {}

  ngOnInit() {
    this._buildForm();

    this._listApiService.getNodeInfo(this.parentIri).subscribe(response => {
      if (response['listinfo']) {
        // root node
        this.placeholder = `Append item to ${(response as ListInfoResponse).listinfo.labels[0].value}`;
      } else {
        // child node
        this.placeholder = `Append item to ${(response as ListNodeInfoResponse).nodeinfo.labels[0].value}`;
      }

      this._cd.markForCheck();
    });
  }

  createChildNode() {
    this.loading = true;

    const data = {
      parentNodeIri: this.parentIri,
      projectIri: this.projectIri,
      labels: this.form.value.labels,
      name: `${this.projectUuid}-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    };

    this._listApiService.createChildNode(data.parentNodeIri, data).subscribe(() => {
      this.loading = false;
      this._resetForm();
      this._listItemService.onUpdate$.next();
    });
  }

  private _buildForm() {
    this.form = this._fb.group({
      labels: this._fb.array(
        this.formData.labels.map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        ),
        atLeastOneStringRequired('value')
      ),
      description: this._fb.array(
        this.formData.descriptions.map(({ language, value }) =>
          this._fb.group({
            language,
            value,
          })
        ),
        atLeastOneStringRequired('value')
      ),
    });
  }

  private _resetForm() {
    this.form.reset({ labels: this.FORM_DEFAULT_VALUE });
  }
}
