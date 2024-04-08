import { DeleteValueDialogComponent } from './delete-value-dialog.component';
import { DisplayEdit2Component } from './display-edit-2.component';
import { NuListActionBubbleComponent } from './nu-list-action-bubble.component';
import { NuListChildComponent } from './nu-list-child.component';
import { NuListComponent } from './nu-list.component';
import { SwitchProperties3Component } from './switch-properties-3.component';
import { BaseSwitchComponent } from './value-components/base-switch.component';
import { ColorSwitchComponent } from './value-components/color-switch.component';
import { GeonameValue2Component } from './value-components/geoname-value-2.component';
import { IntervalValue2Component } from './value-components/interval-value-2.component';
import { LinkValue2Component } from './value-components/link-value-2.component';
import { ListValue2Component } from './value-components/list-value-2.component';
import { NestedMenuComponent } from './value-components/nested-menu.component';
import { TimeValue2Component } from './value-components/time-value-2.component';
import { UriValue2Component } from './value-components/uri-value-2.component';

const valueComponents = [
  ColorSwitchComponent,
  GeonameValue2Component,
  IntervalValue2Component,
  LinkValue2Component,
  ListValue2Component,
  NestedMenuComponent,
  TimeValue2Component,
  UriValue2Component,
];

const switchComponents = [];
export const ResourcePropertiesComponents = [
  ...switchComponents,
  ...valueComponents,
  BaseSwitchComponent,
  DeleteValueDialogComponent,
  NuListComponent,
  SwitchProperties3Component,
  NuListActionBubbleComponent,
  NuListChildComponent,
  DisplayEdit2Component,
];
