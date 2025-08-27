import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SearchParams } from '@dasch-swiss/vre/shared/app-common-to-move';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';

export function forbiddenTermValidator(termRe: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = termRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}

@Component({
  selector: 'app-expert-search',
  templateUrl: './expert-search.component.html',
  styleUrls: ['./expert-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertSearchComponent implements OnInit, AfterViewInit {
  @Output() search = new EventEmitter<SearchParams>();

  @ViewChild('textArea') textAreaElement: ElementRef;

  expertSearchForm: UntypedFormGroup;
  queryFormControl: UntypedFormControl;

  iriBaseUrl = this._os.getIriBaseUrl();

  readonly defaultGravsearchQuery = `PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
PREFIX webern: <${this.iriBaseUrl}/ontology/0806/webern-onto/v2#>

CONSTRUCT {
?s knora-api:isMainResource true .
?s webern:hasTitle ?title .

} WHERE {
?s a knora-api:Resource .
?s a webern:EditedText .
?s webern:hasTitle ?title .
}
`;

  constructor(
    private _os: OntologyService,
    private _fb: UntypedFormBuilder,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.queryFormControl = new UntypedFormControl('');
    this.expertSearchForm = this._fb.group({
      gravsearchquery: ['', [Validators.required, forbiddenTermValidator(/OFFSET/i)]],
    });
  }

  ngAfterViewInit() {
    if (this.textAreaElement?.nativeElement) {
      this.textAreaElement.nativeElement.focus();
      this._cdr.detectChanges();
    }
  }

  resetForm() {
    this.expertSearchForm.reset({});
    this.textAreaElement.nativeElement.focus();
  }

  submitQuery() {
    const gravsearch = `${this.expertSearchForm.controls['gravsearchquery'].value}\nOFFSET 0\n`;
    this.search.emit({
      query: gravsearch,
      mode: 'gravsearch',
    });
  }
}
