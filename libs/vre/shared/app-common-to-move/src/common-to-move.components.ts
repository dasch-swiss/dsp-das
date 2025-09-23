import { DialogHeaderComponent } from './lib/dialog-header.component';
import { HeaderLogoComponent } from './lib/header/header-logo.component';
import { HeaderProjectTabsComponent } from './lib/header/header-project-tabs.component';
import { HeaderRightComponent } from './lib/header/header-right.component';
import { HeaderComponent } from './lib/header/header.component';
import { VersionBadgeComponent } from './lib/header/version-badge.component';
import { SplitPipe } from './lib/split.pipe';
import { StatusComponent } from './lib/status/status.component';

export const CommonToMoveComponents = [
  DialogHeaderComponent,
  SplitPipe,
  HeaderComponent,
  StatusComponent,
  HeaderProjectTabsComponent,
  HeaderRightComponent,
  HeaderLogoComponent,
  VersionBadgeComponent,
];
