import { ColorValueComponent } from './lib/value-components/color-value.component';
import { GeonameValueComponent } from './lib/value-components/geoname-value.component';
import { IntervalValueComponent } from './lib/value-components/interval-value.component';
import { LinkValueComponent } from './lib/value-components/link-value.component';
import { ListValueComponent } from './lib/value-components/list-value.component';
import { DateViewerComponent } from './lib/viewer-components/date-viewer.component';
import { GeonameViewerComponent } from './lib/viewer-components/geoname-viewer.component';

export const TemplateSwitcherComponents = [
  DateViewerComponent,
  GeonameViewerComponent,
  GeonameValueComponent,
  ColorValueComponent,
  LinkValueComponent,
  IntervalValueComponent,
  ListValueComponent,
];
