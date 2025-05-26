import { AddUserComponent } from './lib/collaboration/add-user/add-user.component';
import { CollaborationComponent } from './lib/collaboration/collaboration.component';
import { SelectGroupComponent } from './lib/collaboration/select-group/select-group.component';
import { CreateCopyrightHolderDialogComponent } from './lib/create-copyright-holder-dialog.component';
import { CreateProjectFormPageComponent } from './lib/create-project-form-page.component';
import { DescriptionComponent } from './lib/description/description.component';
import { EditProjectFormPageComponent } from './lib/edit-project-form-page.component';
import { ImageDisplayAbsoluteComponent } from './lib/image-settings/image-display-absolute.component';
import { ImageDisplayRatioComponent } from './lib/image-settings/image-display-ratio.component';
import { ImageSettingsComponent } from './lib/image-settings/image-settings.component';
import { SettingsPageComponent } from './lib/image-settings/settings-page.component';
import { LegalSettingsLicensesComponent } from './lib/legal-settings-licenses.component';
import { LegalSettingsComponent } from './lib/legal-settings.component';
import { ProjectComponent } from './lib/project/project.component';
import { ReusableProjectFormComponent } from './lib/reusable-project-form/reusable-project-form.component';

export const ProjectComponents = [
  CreateProjectFormPageComponent,
  EditProjectFormPageComponent,
  ReusableProjectFormComponent,
  ProjectComponent,
  CollaborationComponent,
  AddUserComponent,
  SelectGroupComponent,
  DescriptionComponent,
  SettingsPageComponent,
  ImageDisplayAbsoluteComponent,
  ImageDisplayRatioComponent,
  ImageSettingsComponent,
  LegalSettingsComponent,
  CreateCopyrightHolderDialogComponent,
  LegalSettingsLicensesComponent,
];
