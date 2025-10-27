import { AlertInfoComponent } from './lib/alert-info.component';
import { AnnotationTabComponent } from './lib/annotation-tab.component';
import { ClosingDialogComponent } from './lib/closing-dialog.component';
import { CompoundArrowNavigationComponent } from './lib/compound/compound-arrow-navigation.component';
import { CompoundNavigationComponent } from './lib/compound/compound-navigation.component';
import { CompoundSliderComponent } from './lib/compound/compound-slider.component';
import { CompoundViewerComponent } from './lib/compound/compound-viewer.component';
import { IncomingResourceHeaderComponent } from './lib/incoming-resource-header.component';
import { PermissionInfoComponent } from './lib/permission-info/permission-info.component';
import { ResourceEditMoreMenuComponent } from './lib/resource-edit-more-menu/resource-edit-more-menu.component';
import { ResourceExplorerButtonComponent } from './lib/resource-explorer-button.component';
import { ResourceFetcherDialogComponent } from './lib/resource-fetcher-dialog.component';
import { ResourceFetcherComponent } from './lib/resource-fetcher.component';
import { ResourceHeaderComponent } from './lib/resource-header.component';
import { ResourceInfoBarComponent } from './lib/resource-info-bar.component';
import { ResourceLegalLicenseComponent } from './lib/resource-legal-license.component';
import { ResourceLegalComponent } from './lib/resource-legal.component';
import { ResourceRepresentationComponent } from './lib/resource-representation.component';
import { ResourceRestrictionComponent } from './lib/resource-restriction.component';
import { ResourceTabsComponent } from './lib/resource-tabs.component';
import { ResourceToolbarComponent } from './lib/resource-toolbar.component';
import { ResourceVersionWarningComponent } from './lib/resource-version-warning.component';
import { ResourceComponent } from './lib/resource.component';
import { SegmentTabComponent } from './lib/segment-tab.component';
import { SingleResourcePageComponent } from './lib/single-resource-page.component';

const CompoundComponents = [
  CompoundArrowNavigationComponent,
  CompoundNavigationComponent,
  CompoundSliderComponent,
  CompoundViewerComponent,
];
export const ResourcePageComponents = [
  ...CompoundComponents,
  ResourceComponent,
  ResourceHeaderComponent,
  ResourceLegalComponent,
  SingleResourcePageComponent,
  ResourceFetcherComponent,
  ResourceRepresentationComponent,
  ResourceTabsComponent,
  ResourceToolbarComponent,
  IncomingResourceHeaderComponent,
  AnnotationTabComponent,
  SegmentTabComponent,
  PermissionInfoComponent,
  ResourceRestrictionComponent,
  ResourceVersionWarningComponent,
  ResourceInfoBarComponent,
  AlertInfoComponent,
  ResourceLegalLicenseComponent,
  ResourceEditMoreMenuComponent,
  ResourceFetcherDialogComponent,
  ResourceExplorerButtonComponent,
  ClosingDialogComponent,
];
