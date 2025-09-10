import { DialogHeaderComponent } from './lib/dialog-header.component';
import { HeaderLogoComponent } from './lib/header/header-logo.component';
import { HeaderRightComponent } from './lib/header/header-right.component';
import { HeaderTabsComponent } from './lib/header/header-tabs.component';
import { HeaderComponent } from './lib/header/header.component';
import { SplitPipe } from './lib/split.pipe';
import { StatusComponent } from './lib/status/status.component';

export const CommonToMoveComponents = [
  DialogHeaderComponent,
  SplitPipe,
  HeaderComponent,
  StatusComponent,
  HeaderTabsComponent,
  HeaderRightComponent,
  HeaderLogoComponent,
];
