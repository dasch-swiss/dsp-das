import { DeleteValueDialogComponent } from './delete-value-dialog.component';
import { ExistingPropertyValueComponent } from './existing-property-value.component';
import { PropertyValueActionBubble } from './property-value-action-bubble.component';
import { PropertyValueSwitcherComponent } from './property-value-switcher.component';
import { PropertyValueComponent } from './property-value.component';
import { PropertyValuesComponent } from './property-values.component';
import { BaseSwitchComponent } from './switch-components/base-switch.component';
import { ColorSwitchComponent } from './switch-components/color-switch.component';
import { DateSwitchComponent } from './switch-components/date-switch.component';
import { GeonameSwitchComponent } from './switch-components/geoname-switch.component';
import { IntervalSwitchComponent } from './switch-components/interval-switch.component';
import { LinkSwitchComponent } from './switch-components/link-switch.component';
import { ListSwitchComponent } from './switch-components/list-switch.component';
import { TextSwitchComponent } from './switch-components/text-switch.component';
import { TimeSwitchComponent } from './switch-components/time-switch.component';
import { UriSwitchComponent } from './switch-components/uri-switch.component';
import { GeonameValueComponent } from './value-components/geoname-value.component';
import { LinkValueComponent } from './value-components/link-value.component';
import { ListValueComponent } from './value-components/list-value.component';
import { NestedMenuComponent } from './value-components/nested-menu.component';

const valueComponents = [GeonameValueComponent, LinkValueComponent, ListValueComponent, NestedMenuComponent];

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
  PropertyValuesComponent,
  PropertyValueSwitcherComponent,
  PropertyValueActionBubble,
  PropertyValueComponent,
  ExistingPropertyValueComponent,
];
