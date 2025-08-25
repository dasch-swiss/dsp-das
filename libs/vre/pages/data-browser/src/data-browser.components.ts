import { ComparisonComponent } from './lib/comparison/comparison.component';
import { MultipleViewerGatewayComponent } from './lib/comparison/multiple-viewer-gateway.component';
import { MultipleViewerComponent } from './lib/comparison/multiple-viewer.component';
import { ListViewNormalComponent } from './lib/list-view/list-view-normal.component';
import { ResourceLinkDialogComponent } from './lib/list-view/resource-link-dialog.component';
import { ResourceListItemComponent } from './lib/list-view/resource-list-item.component';
import { ResourceListSelectionComponent } from './lib/list-view/resource-list-selection.component';
import { ResourceListComponent } from './lib/list-view/resource-list.component';
import { ResourceClassBrowserPageComponent } from './lib/resource-class-browser-page.component';
import { ResourceClassSidenavItemComponent } from './lib/resource-class-sidenav/resource-class-sidenav-item.component';
import { ResourceClassSidenavComponent } from './lib/resource-class-sidenav/resource-class-sidenav.component';

export const DataBrowserComponents = [
  ResourceClassSidenavComponent,
  ResourceClassSidenavItemComponent,
  ResourceClassBrowserPageComponent,
  ComparisonComponent,
  ResourceLinkDialogComponent,
  ListViewNormalComponent,
  MultipleViewerComponent,
  MultipleViewerGatewayComponent,
  ResourceListComponent,
  ResourceListItemComponent,
  ResourceListSelectionComponent,
];
