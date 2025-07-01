import {
  ColorValueComponent,
  DateViewerComponent,
  GeonameValueComponent,
  GeonameViewerComponent,
  IntervalValueComponent,
  IntervalViewerComponent,
  LinkValueComponent,
  LinkViewerComponent,
  ListValueComponent,
  ListViewerComponent,
  NestedMenuComponent,
  RichTextViewerComponent,
  TimeValueComponent,
  TimeViewerComponent,
  ToggleValueComponent,
} from '@dasch-swiss/vre/resource-editor/resource-properties';

const valueComponents = [
  GeonameValueComponent,
  LinkValueComponent,
  ListValueComponent,
  NestedMenuComponent,
  TimeValueComponent,
  IntervalValueComponent,
];

const viewerComponents = [RichTextViewerComponent, ListViewerComponent, IntervalViewerComponent, TimeViewerComponent];

const switchComponents = [
  ColorValueComponent,
  LinkViewerComponent,
  GeonameViewerComponent,
  DateViewerComponent,
  ToggleValueComponent,
];

export const TemplateSwitcherComponents = [...switchComponents, ...valueComponents, ...viewerComponents];
