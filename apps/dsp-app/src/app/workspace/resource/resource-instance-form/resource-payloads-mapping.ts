import { FormControl } from '@angular/forms';
import {
  Constants,
  CreateBooleanValue,
  CreateColorValue,
  CreateDateValue,
  CreateDecimalValue,
  CreateGeonameValue,
  CreateIntervalValue,
  CreateIntValue,
  CreateLinkValue,
  CreateListValue,
  CreateTextValueAsString,
  CreateTimeValue,
  CreateUriValue,
} from '@dasch-swiss/dsp-js';
import { populateValue } from '@dsp-app/src/app/workspace/resource/values/date-value/populate-value-method';

export const propertiesTypeMapping = new Map<string, { newValue: any; mapping: (value: any) => any }>([
  [
    Constants.IntValue,
    {
      newValue: null,
      mapping: (value: number) => {
        const newIntValue = new CreateIntValue();
        newIntValue.int = value;
        return newIntValue;
      },
    },
  ],
  [
    Constants.DecimalValue,
    {
      newValue: null,
      mapping: (value: number) => {
        const newDecimalValue = new CreateDecimalValue();
        newDecimalValue.decimal = value;
        return newDecimalValue;
      },
    },
  ],
  [
    Constants.BooleanValue,
    {
      newValue: null,
      mapping: (value: boolean) => {
        const newBooleanValue = new CreateBooleanValue();
        newBooleanValue.bool = value;
        return newBooleanValue;
      },
    },
  ],
  [
    Constants.TextValue,
    {
      newValue: null,
      mapping: (value: string) => {
        const newTextValue = new CreateTextValueAsString();
        newTextValue.text = value;
        return newTextValue;
      },
    },
  ],
  [
    Constants.DateValue,
    {
      newValue: null,
      mapping: (value: any) => {
        const newDateValue = new CreateDateValue();
        populateValue(newDateValue, value);
        return newDateValue;
      },
    },
  ],
  [
    Constants.TimeValue,
    {
      newValue: null,
      mapping: (value: any) => {
        const newTimeValue = new CreateTimeValue();
        newTimeValue.time = value;
        return newTimeValue;
      },
    },
  ],
  [
    Constants.IntervalValue,
    {
      newValue: null,
      mapping: (value: { start: any; end: any }) => {
        const newIntervalValue = new CreateIntervalValue();
        newIntervalValue.start = value.start;
        newIntervalValue.end = value.end;
        return newIntervalValue;
      },
    },
  ],
  [
    Constants.ColorValue,
    {
      newValue: null,
      mapping: (value: string) => {
        const newColorValue = new CreateColorValue();
        newColorValue.color = value;
        return newColorValue;
      },
    },
  ],
  [
    Constants.ListValue,
    {
      newValue: null,
      mapping: (value: string) => {
        const newListValue = new CreateListValue();
        newListValue.listNode = value;
        return newListValue;
      },
    },
  ],
  [
    Constants.GeonameValue,
    {
      newValue: null,
      mapping: (value: string) => {
        const newGeonameValue = new CreateGeonameValue();
        newGeonameValue.geoname = value;
        return newGeonameValue;
      },
    },
  ],
  [
    Constants.LinkValue,
    {
      newValue: null,
      mapping: (value: string) => {
        const newLinkValue = new CreateLinkValue();
        newLinkValue.linkedResourceIri = value;
        return newLinkValue;
      },
    },
  ],
  [
    Constants.UriValue,
    {
      newValue: null,
      mapping: (value: string) => {
        const newUriValue = new CreateUriValue();
        newUriValue.uri = value;
        return newUriValue;
      },
    },
  ],
]);
