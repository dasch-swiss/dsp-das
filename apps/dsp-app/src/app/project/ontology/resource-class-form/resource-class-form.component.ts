import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClassDefinition, PropertyDefinition } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { OntologiesSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { existingNamesValidator } from '../../../main/directive/existing-name/existing-name.directive';
import { CustomRegex } from '../../../workspace/resource/values/custom-regex';

@Component({
  selector: 'app-resource-class-form',
  templateUrl: './resource-class-form.component.html',
  styleUrls: ['./resource-class-form.component.scss'],
})
export class ResourceClassFormComponent implements OnInit {
  @Input() formData: {
    name: string;
    label: { language: string; value: string }[];
    description: { language: string; value: string }[];
  };
  resourceClassForm: FormGroup;
  existingNames: [RegExp] = [new RegExp('anEmptyRegularExpressionWasntPossible')];
  ontology;

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
  }

  buildForm() {
    this.resourceClassForm = this._fb.group({
      name: [
        this.formData.name,
        Validators.required,
        existingNamesValidator(this.existingNames),
        Validators.pattern(CustomRegex.ID_NAME_REGEX),
      ],
      label: this._fb.array(
        this.formData.description.map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        )
      ),
      description: this._fb.array(
        this.formData.description.map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        )
      ),
    });
  }
}
