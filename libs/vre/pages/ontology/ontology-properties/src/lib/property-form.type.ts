import { FormControl, FormGroup } from '@angular/forms';
import { MultiLanguageForm } from '@dasch-swiss/vre/ui/string-literal';
import { ClassDefinition } from '@dasch-swiss/dsp-js';
import { DefaultProperty } from '@dasch-swiss/vre/shared/app-helper-services';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';

export type PropertyForm = FormGroup<{
  guiElement: FormControl<string>;
  name: FormControl<string>;
  labels: MultiLanguageForm;
  comments: MultiLanguageForm;
  guiAttr: FormControl<string>;
  objectType: FormControl<string>;
}>;

export interface CreatePropertyFormDialogProps {
    propType: DefaultProperty;
}

export interface PropertyData {
    propType: DefaultProperty;
    name?: string;
    labels?: StringLiteralV2[];
    comments?: StringLiteralV2[];
    guiElement?: string;
    guiAttribute?: string;
    objectType?: string;
}

export interface CreatePropertyData extends PropertyData {
    name: string; // override to required
    labels: StringLiteralV2[]; // override to required
    classDef?: ClassDefinition;
}
