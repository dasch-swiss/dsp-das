import { DeleteValueDialogComponent } from './delete-value-dialog.component';
import { DisplayEdit2Component } from './display-edit-2.component';
import { NuListActionBubbleComponent } from './nu-list-action-bubble.component';
import { NuListChildComponent } from './nu-list-child.component';
import { NuListComponent } from './nu-list.component';
import { DefaultSwitchComponent } from './switch-components/default-switch.component';
import { GeonameSwitchComponent } from './switch-components/geoname-switch.component';
import { TimeSwitchComponent } from './switch-components/time-switch.component';
import { SwitchProperties3Component } from './switch-properties-3.component';
import { ColorSwitchComponent } from './value-components/color-switch.component';
import { GeonameValue2Component } from './value-components/geoname-value-2.component';
import { IntervalSwitchComponent } from './value-components/interval-switch.component';
import { LinkValue2Component } from './value-components/link-value-2.component';
import { ListValue2Component } from './value-components/list-value-2.component';
import { NestedMenuComponent } from './value-components/nested-menu.component';
import { UriSwitchComponent } from './value-components/uri-switch.component';

const valueComponents = [GeonameValue2Component, LinkValue2Component, ListValue2Component, NestedMenuComponent];

const switchComponents = [
  TimeSwitchComponent,
  ColorSwitchComponent,
  IntervalSwitchComponent,
  UriSwitchComponent,
  GeonameSwitchComponent,
  DefaultSwitchComponent,
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
