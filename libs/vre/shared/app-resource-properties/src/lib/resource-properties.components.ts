import { DeleteValueDialogComponent } from './delete-value-dialog.component';
import { NuListActionBubbleComponent } from './nu-list-action-bubble.component';
import { NuListChildComponent } from './nu-list-child.component';
import { NuListComponent } from './nu-list.component';
import { SwitchProperties3Component } from './switch-properties-3.component';
import { BooleanValue2Component } from './value-components/boolean-value-2.component';
import { ColorValue2Component } from './value-components/color-value-2.component';
import { GeonameValue2Component } from './value-components/geoname-value-2.component';
import { IntValue2Component } from './value-components/int-value-2.component';
import { LinkValue2Component } from './value-components/link-value-2.component';
import { ListValue2Component } from './value-components/list-value-2.component';
import { NestedMenuComponent } from './value-components/nested-menu.component';
import { TimeValue2Component } from './value-components/time-value-2.component';
import { UriValue2Component } from './value-components/uri-value-2.component';

const valueComponents = [
  BooleanValue2Component,
  ColorValue2Component,
  GeonameValue2Component,
  IntValue2Component,
  LinkValue2Component,
  ListValue2Component,
  NestedMenuComponent,
  TimeValue2Component,
  UriValue2Component,
];

const switchComponents = [];
export const ResourcePropertiesComponents = [
  ...valueComponents,
  ...switchComponents,
  DeleteValueDialogComponent,
  NuListComponent,
  NuListActionBubbleComponent,
  NuListChildComponent,
  SwitchProperties3Component,
];

export const ZComponents = [];
