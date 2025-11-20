import { GlobalSearchComponent } from './lib/header/global-search.component';
import { HeaderLogoComponent } from './lib/header/header-logo.component';
import { HeaderUserActionsComponent } from './lib/header/header-user-actions.component';
import { HeaderComponent } from './lib/header/header.component';
import { UserMenuComponent } from './lib/header/user-menu/user-menu.component';
import { VersionBadgeComponent } from './lib/header/version-badge.component';
import { SplitPipe } from './lib/split.pipe';
import { StatusComponent } from './lib/status/status.component';

export const CommonToMoveComponents = [
  SplitPipe,
  HeaderComponent,
  StatusComponent,
  HeaderUserActionsComponent,
  UserMenuComponent,
  HeaderLogoComponent,
  VersionBadgeComponent,
  GlobalSearchComponent,
];
