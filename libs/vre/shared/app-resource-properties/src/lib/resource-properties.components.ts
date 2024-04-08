import { DeleteValueDialogComponent } from './delete-value-dialog.component';
import { DisplayEdit2Component } from './display-edit-2.component';
import { NuListActionBubbleComponent } from './nu-list-action-bubble.component';
import { NuListChildComponent } from './nu-list-child.component';
import { NuListComponent } from './nu-list.component';
import { BooleanSwitchComponent } from './switch-components/boolean-switch.component';
import { TextSwitchComponent } from './switch-components/text-switch.component';
import { SwitchProperties3Component } from './switch-properties-3.component';
import { ColorValue2Component } from './value-components/color-value-2.component';
import { GeonameValue2Component } from './value-components/geoname-value-2.component';
import { IntSwitchComponent } from './value-components/int-switch.component';
import { IntervalValue2Component } from './value-components/interval-value-2.component';
import { LinkValue2Component } from './value-components/link-value-2.component';
import { ListValue2Component } from './value-components/list-value-2.component';
import { NestedMenuComponent } from './value-components/nested-menu.component';
import { TimeValue2Component } from './value-components/time-value-2.component';
import { UriValue2Component } from './value-components/uri-value-2.component';

const valueComponents = [
  ColorValue2Component,
  GeonameValue2Component,
  IntervalValue2Component,
  LinkValue2Component,
  ListValue2Component,
  NestedMenuComponent,
  TimeValue2Component,
  UriValue2Component,
];

const switchComponents = [TextSwitchComponent, IntSwitchComponent, BooleanSwitchComponent];
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
