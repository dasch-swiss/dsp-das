import { DeleteValueDialogComponent } from './delete-value-dialog.component';
import { DisplayEdit2Component } from './display-edit-2.component';
import { NuListActionBubbleComponent } from './nu-list-action-bubble.component';
import { NuListChildComponent } from './nu-list-child.component';
import { NuListComponent } from './nu-list.component';
import { BaseSwitchComponent } from './switch-components/base-switch.component';
import { DateSwitchComponent } from './switch-components/date-switch.component';
import { GeonameSwitchComponent } from './switch-components/geoname-switch.component';
import { IntervalSwitchComponent } from './switch-components/interval-switch.component';
import { LinkSwitchComponent } from './switch-components/link-switch.component';
import { ListSwitchComponent } from './switch-components/list-switch.component';
import { TextSwitchComponent } from './switch-components/text-switch.component';
import { TimeSwitchComponent } from './switch-components/time-switch.component';
import { UriSwitchComponent } from './switch-components/uri-switch.component';
import { SwitchProperties3Component } from './switch-properties-3.component';
import { ColorSwitchComponent } from './value-components/color-switch.component';
import { GeonameValue2Component } from './value-components/geoname-value-2.component';
import { LinkValue2Component } from './value-components/link-value-2.component';
import { ListValue2Component } from './value-components/list-value-2.component';
import { NestedMenuComponent } from './value-components/nested-menu.component';

const valueComponents = [GeonameValue2Component, LinkValue2Component, ListValue2Component, NestedMenuComponent];

const switchComponents = [
  TimeSwitchComponent,
  ColorSwitchComponent,
  IntervalSwitchComponent,
  LinkSwitchComponent,
  UriSwitchComponent,
  GeonameSwitchComponent,
  ListSwitchComponent,
  DateSwitchComponent,
  BaseSwitchComponent,
  TextSwitchComponent,
];

export const ResourcePropertiesComponents = [
  ...switchComponents,
  ...valueComponents,
  DeleteValueDialogComponent,
  NuListComponent,
  SwitchProperties3Component,
  NuListActionBubbleComponent,
  NuListChildComponent,
  DisplayEdit2Component,
];
