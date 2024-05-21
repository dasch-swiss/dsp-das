import { AnnotationTabComponent } from './lib/annotation-tab.component';
import { CompoundArrowNavigationComponent } from './lib/compound/compound-arrow-navigation.component';
import { CompoundNavigationComponent } from './lib/compound/compound-navigation.component';
import { CompoundSliderComponent } from './lib/compound/compound-slider.component';
import { CompoundViewerComponent } from './lib/compound/compound-viewer.component';
import { ResourceHeaderComponent } from './lib/resource-header.component';
import { ResourcePage2Component } from './lib/resource-page-2.component';
import { ResourcePageComponent } from './lib/resource-page.component';
import { ResourceParentComponent } from './lib/resource-parent.component';
import { ResourceRepresentationsComponent } from './lib/resource-representations.component';
import { ResourceTabsComponent } from './lib/resource-tabs.component';
import { ResourceToolbarComponent } from './lib/resource-toolbar.component';
import { ResourceComponent } from './lib/resource.component';

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
  ResourcePageComponent,
  ResourcePage2Component,
  ResourceParentComponent,
  ResourceRepresentationsComponent,
  ResourceTabsComponent,
  ResourceToolbarComponent,
  AnnotationTabComponent,
];
