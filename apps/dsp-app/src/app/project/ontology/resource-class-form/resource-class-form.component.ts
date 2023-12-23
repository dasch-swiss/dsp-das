import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClassDefinition, PropertyDefinition } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { OntologiesSelectors } from '@dasch-swiss/vre/shared/app-state';
import { atLeastOneStringRequired } from '@dsp-app/src/app/project/reusable-project-form/at-least-one-string-required.validator';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { existingNamesValidator } from '../../../main/directive/existing-name/existing-name.directive';
import { CustomRegex } from '../../../workspace/resource/values/custom-regex';

@Component({
  selector: 'app-resource-class-form',
  templateUrl: './resource-class-form.component.html',
  styleUrls: ['./resource-class-form.component.scss'],
})
export class ResourceClassFormComponent implements OnInit, OnDestroy {
  @Input() formData: {
    name: string;
    label: { language: string; value: string }[];
    description: { language: string; value: string }[];
  };
  @Output() formValueChange = new EventEmitter<FormGroup>();

  form: FormGroup;
  existingNames: [RegExp] = [new RegExp('anEmptyRegularExpressionWasntPossible')];
  ontology;
  subscription: Subscription;
  constructor(
    private _fb: FormBuilder,
    private _os: OntologyService,
    private _store: Store
  ) {}

  ngOnInit() {
    this.ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    const resourceClasses = getAllEntityDefinitionsAsArray(this.ontology.classes);
    const resourceProperties = getAllEntityDefinitionsAsArray(this.ontology.properties);

    // set list of all existing resource class names to avoid same name twice
    resourceClasses.forEach((resClass: ClassDefinition) => {
      const name = this._os.getNameFromIri(resClass.id);
      this.existingNames.push(new RegExp(`(?:^|W)${name.toLowerCase()}(?:$|W)`));
    });

    // add all resource properties to the same list
    resourceProperties.forEach((resProp: PropertyDefinition) => {
      const name = this._os.getNameFromIri(resProp.id);
      this.existingNames.push(new RegExp(`(?:^|W)${name.toLowerCase()}(?:$|W)`));
    });

    this.buildForm();

    this.subscription = this.form.valueChanges.subscribe(z => {
      this.formValueChange.emit(this.form);
    });
    this.formValueChange.emit(this.form);
  }

  buildForm() {
    this.form = this._fb.group({
      name: [
        this.formData.name,
        [
          Validators.required,
          existingNamesValidator(this.existingNames),
          Validators.pattern(CustomRegex.ID_NAME_REGEX),
        ],
      ],
      label: this._fb.array(
        this.formData.description.map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        ),
        atLeastOneStringRequired('value')
      ),
      description: this._fb.array(
        this.formData.description.map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        ),
        atLeastOneStringRequired('value')
      ),
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
