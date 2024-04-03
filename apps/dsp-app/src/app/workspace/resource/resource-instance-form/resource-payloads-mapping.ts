import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
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
  CreateValue,
  ReadBooleanValue,
  ReadColorValue,
  ReadDateValue,
  ReadDecimalValue,
  ReadGeonameValue,
  ReadIntervalValue,
  ReadIntValue,
  ReadLinkValue,
  ReadListValue,
  ReadTextValue,
  ReadTimeValue,
  ReadUriValue,
  ReadValue,
  UpdateBooleanValue,
  UpdateColorValue,
  UpdateDateValue,
  UpdateDecimalValue,
  UpdateGeonameValue,
  UpdateIntervalValue,
  UpdateIntValue,
  UpdateLinkValue,
  UpdateListValue,
  UpdateTextValueAsString,
  UpdateTimeValue,
  UpdateUriValue,
  UpdateValue,
} from '@dasch-swiss/dsp-js';
import { CustomRegex } from '@dsp-app/src/app/workspace/resource/values/custom-regex';
import { populateValue } from '@dsp-app/src/app/workspace/resource/values/date-value/populate-value-method';

export const propertiesTypeMapping = new Map<
  string,
  {
    newValue: any;
    control: (value?: ReadValue) => AbstractControl;
    mapping: (value: any) => CreateValue;
    updateMapping: (id: string, value: any) => UpdateValue;
  }
>([
  [
    Constants.IntValue,
    {
      newValue: null,
      control: (value?: ReadIntValue) => new FormControl(value?.int ?? 0, Validators.required),
      mapping: (value: number) => {
        const newIntValue = new CreateIntValue();
        newIntValue.int = value;
        return newIntValue;
      },
      updateMapping: (id: string, value: number) => {
        const newIntValue = new UpdateIntValue();
        newIntValue.id = id;
        newIntValue.int = value;
        return newIntValue;
      },
    },
  ],
  [
    Constants.DecimalValue,
    {
      newValue: null,
      control: (value?: ReadDecimalValue) => new FormControl(value?.decimal ?? 0, Validators.required),

      mapping: (value: number) => {
        const newDecimalValue = new CreateDecimalValue();
        newDecimalValue.decimal = value;
        return newDecimalValue;
      },
      updateMapping: (id: string, value: number) => {
        const newDecimalValue = new UpdateDecimalValue();
        newDecimalValue.id = id;
        newDecimalValue.decimal = value;
        return newDecimalValue;
      },
    },
  ],
  [
    Constants.BooleanValue,
    {
      newValue: null,
      control: (value?: ReadBooleanValue) => new FormControl(value?.bool, Validators.required),

      mapping: (value: boolean) => {
        const newBooleanValue = new CreateBooleanValue();
        newBooleanValue.bool = value;
        return newBooleanValue;
      },
      updateMapping: (id: string, value: boolean) => {
        const newBooleanValue = new UpdateBooleanValue();
        newBooleanValue.id = id;
        newBooleanValue.bool = value;
        return newBooleanValue;
      },
    },
  ],
  [
    Constants.TextValue,
    {
      newValue: null,
      control: (value?: ReadTextValue) => new FormControl(value?.strval, Validators.required),

      mapping: (value: string) => {
        const newTextValue = new CreateTextValueAsString();
        newTextValue.text = value;
        return newTextValue;
      },
      updateMapping: (id: string, value: string) => {
        const newTextValue = new UpdateTextValueAsString();
        newTextValue.id = id;
        newTextValue.text = value;
        return newTextValue;
      },
    },
  ],
  [
    Constants.DateValue,
    {
      newValue: null,
      control: (value?: ReadDateValue) => new FormControl(value?.date, Validators.required),
      mapping: (value: any) => {
        const newDateValue = new CreateDateValue();
        populateValue(newDateValue, value);
        return newDateValue;
      },
      updateMapping: (id: string, value: any) => {
        const newDateValue = new UpdateDateValue();
        newDateValue.id = id;
        populateValue(newDateValue, value);
        return newDateValue;
      },
    },
  ],
  [
    Constants.TimeValue,
    {
      newValue: null,
      control: (value?: ReadTimeValue) =>
        new FormGroup({
          date: new FormControl(value?.time, Validators.required), // TODO
          time: new FormControl(value?.time, Validators.required),
        }),

      mapping: (value: any) => {
        const newTimeValue = new CreateTimeValue();
        newTimeValue.time = value;
        return newTimeValue;
      },
      updateMapping: (id: string, value: any) => {
        const newTimeValue = new UpdateTimeValue();
        newTimeValue.id = id;
        newTimeValue.time = value;
        return newTimeValue;
      },
    },
  ],
  [
    Constants.IntervalValue,
    {
      newValue: null,
      control: (value?: ReadIntervalValue) =>
        new FormGroup({
          start: new FormControl(value?.start, Validators.required),
          end: new FormControl(value?.end, Validators.required),
        }),
      mapping: (value: { start: number; end: number }) => {
        const newIntervalValue = new CreateIntervalValue();
        newIntervalValue.start = value.start;
        newIntervalValue.end = value.end;
        return newIntervalValue;
      },
      updateMapping: (id: string, value: { start: number; end: number }) => {
        const newIntervalValue = new UpdateIntervalValue();
        newIntervalValue.id = id;
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
      control: (value?: ReadColorValue) => new FormControl(value?.color ?? '#000000'),
      mapping: (value: string) => {
        const newColorValue = new CreateColorValue();
        newColorValue.color = value;
        return newColorValue;
      },
      updateMapping: (id: string, value: string) => {
        const newColorValue = new UpdateColorValue();
        newColorValue.id = id;
        newColorValue.color = value;
        return newColorValue;
      },
    },
  ],
  [
    Constants.ListValue,
    {
      newValue: null,
      control: (value?: ReadListValue) => new FormControl(value?.listNode, Validators.required),
      mapping: (value: string) => {
        const newListValue = new CreateListValue();
        newListValue.listNode = value;
        return newListValue;
      },
      updateMapping: (id: string, value: string) => {
        const newListValue = new UpdateListValue();
        newListValue.id = id;
        newListValue.listNode = value;
        return newListValue;
      },
    },
  ],
  [
    Constants.GeonameValue,
    {
      newValue: null,
      control: (value?: ReadGeonameValue) => new FormControl(value?.geoname, Validators.required),

      mapping: (value: string) => {
        const newGeonameValue = new CreateGeonameValue();
        newGeonameValue.geoname = value;
        return newGeonameValue;
      },
      updateMapping: (id: string, value: string) => {
        const newGeonameValue = new UpdateGeonameValue();
        newGeonameValue.id = id;
        newGeonameValue.geoname = value;
        return newGeonameValue;
      },
    },
  ],
  [
    Constants.LinkValue,
    {
      newValue: null,
      control: (value?: ReadLinkValue) =>
        new FormControl(value?.linkedResourceIri, [Validators.required, Validators.pattern(/http:\/\/rdfh.ch\/.*/)]),
      mapping: (value: string) => {
        const newLinkValue = new CreateLinkValue();
        newLinkValue.linkedResourceIri = value;
        return newLinkValue;
      },
      updateMapping: (id: string, value: string) => {
        const newLinkValue = new UpdateLinkValue();
        newLinkValue.id = id;
        newLinkValue.linkedResourceIri = value;
        return newLinkValue;
      },
    },
  ],
  [
    Constants.UriValue,
    {
      newValue: null,
      control: (value?: ReadUriValue) =>
        new FormControl(value?.uri, [Validators.required, Validators.pattern(CustomRegex.URI_REGEX)]),
      mapping: (value: string) => {
        const newUriValue = new CreateUriValue();
        newUriValue.uri = value;
        return newUriValue;
      },
      updateMapping: (id: string, value: string) => {
        const newUriValue = new UpdateUriValue();
        newUriValue.id = id;
        newUriValue.uri = value;
        return newUriValue;
      },
    },
  ],
]);
