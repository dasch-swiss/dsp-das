import { IriLabelPair } from '../model';

export interface FilterChipData {
  id: string;
  resourceClassIri: string;
  resourceClassLabel: string;
  propertyIri: string;
  propertyLabel: string;
  propertyType: PropertyType;
  operatorIri: string;
  operatorLabel: string;
  value: string | IriLabelPair | null;
  valueLabel: string;
  parentId?: string;
}

export type PropertyType = 'text' | 'date' | 'integer' | 'decimal' | 'boolean' | 'list' | 'link' | 'uri';

export const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  text: 'text_fields',
  date: 'event',
  integer: 'tag',
  decimal: 'tag',
  boolean: 'check_box',
  list: 'list',
  link: 'link',
  uri: 'link',
};

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  text: 'rgba(33, 150, 243, 0.15)',
  date: 'rgba(76, 175, 80, 0.15)',
  integer: 'rgba(255, 152, 0, 0.15)',
  decimal: 'rgba(255, 152, 0, 0.15)',
  boolean: 'rgba(156, 39, 176, 0.15)',
  list: 'rgba(0, 188, 212, 0.15)',
  link: 'rgba(233, 30, 99, 0.15)',
  uri: 'rgba(121, 85, 72, 0.15)',
};

export const RESOURCE_CLASS_COLORS = {
  unselected: 'rgba(0, 0, 0, 0.08)',
  selected: 'rgba(103, 58, 183, 0.15)',
} as const;
