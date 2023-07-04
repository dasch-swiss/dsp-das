import { Injectable } from '@angular/core';
import {
    Constants,
    KnoraDate,
    Precision,
    ReadFormattedTextValue,
    ReadValue,
    ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import {
    CalendarDate,
    CalendarPeriod,
    GregorianCalendarDate,
    IslamicCalendarDate,
    JDNConvertibleCalendar,
    JulianCalendarDate,
} from '@dasch-swiss/jdnconvertiblecalendar';

@Injectable({
    providedIn: 'root',
})
export class ValueService {
    constants = Constants;

    constructor() {}

    /**
     * given the ObjectType of a PropertyDefinition, compares it to the provided value type.
     * Primarily used to check if a TextValue type is equal to one of the readonly strings in this class.
     *
     * @param objectType PropertyDefinition ObjectType
     * @param valueType Value type (ReadValue, DeleteValue, BaseValue, etc.)
     */
    compareObjectTypeWithValueType(
        objectType: string,
        valueType: string
    ): boolean {
        return objectType === valueType;
    }

    /**
     * determines if a text can be edited using the text editor.
     *
     * @param textValue the text value to be checked.
     */
    isTextEditable(textValue: ReadFormattedTextValue): boolean {
        return textValue.mapping === Constants.StandardMapping;
    }

    /**
     * determines if the given value can be edited.
     *
     * @param valueTypeOrClass the type or class of the given value.
     * @param value the given value.
     * @param propertyDef the given values property definition.
     */
    isReadOnly(
        valueTypeOrClass: string,
        value: ReadValue,
        propertyDef: ResourcePropertyDefinition
    ): boolean {
        // if value is not editable in general from the ontology,
        // flag it as read-only
        if (!propertyDef.isEditable) {
            return true;
        }

        // only texts complying with the standard mapping can be edited using CKEditor.
        const xmlValueNonStandardMapping =
            valueTypeOrClass === this.constants.FormattedTextValue &&
            value instanceof ReadFormattedTextValue &&
            !this.isTextEditable(value);

        return (
            valueTypeOrClass === this.constants.CustomFormattedTextValue ||
            valueTypeOrClass === this.constants.GeomValue ||
            xmlValueNonStandardMapping
        );
    }

    /**
     * calculates the number of days in a month for a given year.
     *
     * @param calendar the date's calendar.
     * @param year the date's year.
     * @param month the date's month.
     */
    calculateDaysInMonth(
        calendar: string,
        year: number,
        month: number
    ): number {
        const date = new CalendarDate(year, month, 1);
        if (calendar === 'GREGORIAN') {
            const calDate = new GregorianCalendarDate(
                new CalendarPeriod(date, date)
            );
            return calDate.daysInMonth(date);
        } else if (calendar === 'JULIAN') {
            const calDate = new JulianCalendarDate(
                new CalendarPeriod(date, date)
            );
            return calDate.daysInMonth(date);
        } else if (calendar === 'ISLAMIC') {
            const calDate = new IslamicCalendarDate(
                new CalendarPeriod(date, date)
            );
            return calDate.daysInMonth(date);
        } else {
            throw Error('Unknown calendar ' + calendar);
        }
    }

    /**
     * given a historical date (year), returns the astronomical year.
     *
     * @param year year of the given date.
     * @param era era of the given date.
     */
    convertHistoricalYearToAstronomicalYear(
        year: number,
        era: string
    ) {
        let yearAstro = year;
        if (era === 'BCE') {
            // convert historical date to astronomical date
            yearAstro = yearAstro * -1 + 1;
        }
        return yearAstro;
    }

    /**
     * given a Knora calendar date, creates a JDN calendar date
     * taking into account precision.
     *
     * @param date the Knora calendar date.
     */
    createJDNCalendarDateFromKnoraDate(
        date: KnoraDate
    ): JDNConvertibleCalendar {
        let calPeriod: CalendarPeriod;

        const yearAstro = this.convertHistoricalYearToAstronomicalYear(
            date.year,
            date.era
        );

        if (date.precision === Precision.dayPrecision) {
            calPeriod = new CalendarPeriod(
                new CalendarDate(yearAstro, date.month, date.day),
                new CalendarDate(yearAstro, date.month, date.day)
            );
        } else if (date.precision === Precision.monthPrecision) {
            calPeriod = new CalendarPeriod(
                new CalendarDate(yearAstro, date.month, 1),
                new CalendarDate(
                    yearAstro,
                    date.month,
                    this.calculateDaysInMonth(
                        date.calendar,
                        date.year,
                        date.month
                    )
                )
            );
        } else if (date.precision === Precision.yearPrecision) {
            calPeriod = new CalendarPeriod(
                new CalendarDate(yearAstro, 1, 1),
                new CalendarDate(
                    yearAstro,
                    12,
                    this.calculateDaysInMonth(date.calendar, date.year, 12)
                )
            );
        } else {
            throw Error('Invalid precision');
        }

        if (date.calendar === 'GREGORIAN') {
            return new GregorianCalendarDate(calPeriod);
        } else if (date.calendar === 'JULIAN') {
            return new JulianCalendarDate(calPeriod);
        } else if (date.calendar === 'ISLAMIC') {
            return new IslamicCalendarDate(calPeriod);
        } else {
            throw Error('Invalid calendar');
        }
    }
}
