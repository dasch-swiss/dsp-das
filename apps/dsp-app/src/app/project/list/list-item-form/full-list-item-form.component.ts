import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListInfoResponse, ListNode, ListNodeInfoResponse } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { MultiLanguages } from '@dasch-swiss/vre/shared/app-string-literal';
import { atLeastOneStringRequired } from '../../reusable-project-form/at-least-one-string-required.validator';
import { ListItemService } from '../list-item/list-item.service';

@Component({
  selector: 'app-full-list-item-form',
  template: `
    <form>
      <dasch-swiss-multi-language-input [formGroup]="form" controlName="labels" placeholder="Label">
      </dasch-swiss-multi-language-input>
      <dasch-swiss-multi-language-textarea
        [formGroup]="form"
        controlName="descriptions"
        placeholder="Description"></dasch-swiss-multi-language-textarea>
    </form>
  `,
})
export class FullListItemFormComponent implements OnInit {
  @Input() projectIri: string;
  @Input() parentIri: string;
  @Input() formData: { labels: MultiLanguages; descriptions: MultiLanguages };
  @Output() formValueChange = new EventEmitter<FormGroup>();
  loading = false;

  form: FormGroup;
  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this._buildForm();
    this.formValueChange.emit(this.form);
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
      descriptions: this._fb.array(
        this.formData.descriptions.map(({ language, value }) =>
          this._fb.group({
            language,
            value,
          })
        )
      ),
    });
  }
}
