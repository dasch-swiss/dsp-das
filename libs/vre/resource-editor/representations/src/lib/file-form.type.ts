import { FormControl, FormGroup } from '@angular/forms';
// import { LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';

interface LicenseDto {
  id: string;
  uri: string;
  labelEn: string;
}

export type CreateResourceFormLegal = FormGroup<{
  copyrightHolder: FormControl<string | null>;
  license: FormControl<LicenseDto | null>;
  authorship: FormControl<string[] | null>;
}>;

export type FileForm = FormGroup<{
  link: FormControl<string | null>;
  legal: CreateResourceFormLegal;
}>;
