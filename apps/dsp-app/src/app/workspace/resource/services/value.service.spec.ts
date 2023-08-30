import { TestBed } from '@angular/core/testing';

import {
    Constants,
    KnoraDate,
    MockResource,
    ReadDateValue,
    ReadFormattedTextValue,
    ReadIntValue,
    ReadLinkValue,
    ReadUnformattedTextValue,
    ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { ValueService } from './value.service';

describe('ValueService', () => {
    let service: ValueService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ValueService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isTextEditable', () => {
        it('should determine if a given text with the standard mapping is editable', () => {
            const readFormattedTextValue = new ReadFormattedTextValue();
            readFormattedTextValue.type =
                'http://api.knora.org/ontology/knora-api/v2#FormattedTextValue';
            readFormattedTextValue.mapping = Constants.StandardMapping;
            expect(service.isTextEditable(readFormattedTextValue)).toBeTruthy();
        });

        it('should determine if a given text with a custom mapping is editable', () => {
            const readFormattedTextValue = new ReadFormattedTextValue();
            readFormattedTextValue.type =
                'http://api.knora.org/ontology/knora-api/v2#FormattedTextValue';
            readFormattedTextValue.mapping =
                'http://rdfh.ch/standoff/mappings/CustomMapping';
            expect(service.isTextEditable(readFormattedTextValue)).toBeFalsy();
        });
    });

    describe('isReadOnly', () => {
        it('should not mark a ReadIntValue as ReadOnly', () => {
            const readIntValue = new ReadIntValue();
            readIntValue.type =
                'http://api.knora.org/ontology/knora-api/v2#IntValue';

            const resPropDef = new ResourcePropertyDefinition();
            resPropDef.isEditable = true;

            expect(
                service.isReadOnly(readIntValue.type, readIntValue, resPropDef)
            ).toBeFalsy();
        });

        it('should not mark ReadUnformattedTextValue as ReadOnly', () => {
            const readUnformattedTextValue = new ReadUnformattedTextValue();
            readUnformattedTextValue.type =
                'http://api.knora.org/ontology/knora-api/v2#UnformattedTextValue';

            const resPropDef = new ResourcePropertyDefinition();
            resPropDef.isEditable = true;

            expect(
                service.isReadOnly(
                    readUnformattedTextValue.type,
                    readUnformattedTextValue,
                    resPropDef
                )
            ).toBeFalsy();
        });

        it('should not mark ReadTextValueAsXml with standard mapping as ReadOnly', () => {
            const readFormattedTextValue = new ReadFormattedTextValue();
            readFormattedTextValue.type =
                'http://api.knora.org/ontology/knora-api/v2#FormattedTextValue';
            readFormattedTextValue.mapping = Constants.StandardMapping;

            const resPropDef = new ResourcePropertyDefinition();
            resPropDef.isEditable = true;

            // const valueClass = service.getValueTypeOrClass(readTextValueAsXml);
            expect(
                service.isReadOnly(readFormattedTextValue.type, readFormattedTextValue, resPropDef)
            ).toBeFalsy();
        });

        it('should mark ReadTextValueAsXml with custom mapping as ReadOnly', () => {
            const readFormattedTextValue = new ReadFormattedTextValue();
            readFormattedTextValue.type =
                'http://api.knora.org/ontology/knora-api/v2#FormattedTextValue';
            readFormattedTextValue.mapping =
                'http://rdfh.ch/standoff/mappings/CustomMapping';

            const resPropDef = new ResourcePropertyDefinition();
            resPropDef.isEditable = true;

            expect(
                service.isReadOnly(readFormattedTextValue.type, readFormattedTextValue, resPropDef)
            ).toBeTruthy();
        });

        it('should mark a standoff link value as ReadOnly', () => {
            const readStandoffLinkValue = new ReadLinkValue();
            readStandoffLinkValue.type =
                'http://api.knora.org/ontology/knora-api/v2#LinkValue';

            const resPropDef = new ResourcePropertyDefinition();
            resPropDef.isEditable = false;

            expect(
                service.isReadOnly(
                    readStandoffLinkValue.type,
                    readStandoffLinkValue,
                    resPropDef
                )
            ).toBeTruthy();
        });

        it('should not mark ReadDateValue with supported era as ReadOnly', (done) => {
            MockResource.getTestThing().subscribe((res) => {
                const date: ReadDateValue = res.getValuesAs(
                    'http://0.0.0.0:3333/ontology/0001/anything/v2#hasDate',
                    ReadDateValue
                )[0];

                date.date = new KnoraDate('GREGORIAN', 'CE', 2019, 5, 13);

                const resPropDef = new ResourcePropertyDefinition();
                resPropDef.isEditable = true;

                expect(
                    service.isReadOnly(date.type, date, resPropDef)
                ).toBeFalsy();

                done();
            });
        });

        it('should not mark ReadDateValue with supported precision as ReadOnly', (done) => {
            MockResource.getTestThing().subscribe((res) => {
                const date: ReadDateValue = res.getValuesAs(
                    'http://0.0.0.0:3333/ontology/0001/anything/v2#hasDate',
                    ReadDateValue
                )[0];

                date.date = new KnoraDate('GREGORIAN', 'CE', 2019, 5, 1);

                const resPropDef = new ResourcePropertyDefinition();
                resPropDef.isEditable = true;

                expect(
                    service.isReadOnly(date.type, date, resPropDef)
                ).toBeFalsy();

                done();
            });
        });
    });

    describe('compareObjectTypeWithValueType', () => {
        it('should successfully compare "http://api.knora.org/ontology/knora-api/v2#UnformattedTextValue" with "UnformattedTextValue"', () => {
            expect(
                service.compareObjectTypeWithValueType(
                    'http://api.knora.org/ontology/knora-api/v2#UnformattedTextValue',
                    'http://api.knora.org/ontology/knora-api/v2#UnformattedTextValue'
                )
            ).toBeTruthy();
        });

        it('should successfully compare "http://api.knora.org/ontology/knora-api/v2#FormattedTextValue" with "ReadFormattedTextValue"', () => {
            expect(
                service.compareObjectTypeWithValueType(
                    'http://api.knora.org/ontology/knora-api/v2#FormattedTextValue',
                    'http://api.knora.org/ontology/knora-api/v2#FormattedTextValue'
                )
            ).toBeTruthy();
        });

        it('should successfully compare "http://api.knora.org/ontology/knora-api/v2#IntValue" with "http://api.knora.org/ontology/knora-api/v2#IntValue"', () => {
            expect(
                service.compareObjectTypeWithValueType(
                    'http://api.knora.org/ontology/knora-api/v2#IntValue',
                    'http://api.knora.org/ontology/knora-api/v2#IntValue'
                )
            ).toBeTruthy();
        });

        it('should fail to compare an IntValue with a DecimalValue', () => {
            expect(
                service.compareObjectTypeWithValueType(
                    'http://api.knora.org/ontology/knora-api/v2#IntValue',
                    'http://api.knora.org/ontology/knora-api/v2#DecimalValue'
                )
            ).toBeFalsy();
        });

        it('should fail to compare "http://api.knora.org/ontology/knora-api/v2#IntValue" with "http://api.knora.org/ontology/knora-api/v2#UnformattedTextValue"', () => {
            expect(
                service.compareObjectTypeWithValueType(
                    'http://api.knora.org/ontology/knora-api/v2#UnformattedTextValue',
                    'http://api.knora.org/ontology/knora-api/v2#IntValue'
                )
            ).toBeFalsy();
        });
    });

    describe('calculateDaysInMonth', () => {
        it('should calculate the number of days in February in a leap year', () => {
            expect(service.calculateDaysInMonth('GREGORIAN', 2020, 2)).toEqual(
                29
            );
        });

        it('should calculate the number of days in February in a non leap year', () => {
            expect(service.calculateDaysInMonth('GREGORIAN', 2021, 2)).toEqual(
                28
            );
        });

        it('should calculate the number of days in March', () => {
            expect(service.calculateDaysInMonth('GREGORIAN', 2021, 3)).toEqual(
                31
            );
        });
    });

    describe('createJDNCalendarDateFromKnoraDate', () => {
        it('should create a JDN calendar date from a Knora date with day precision in the Gregorian calendar', () => {
            const calDateJDN = service.createJDNCalendarDateFromKnoraDate(
                new KnoraDate('GREGORIAN', 'CE', 2021, 3, 15)
            );

            const period = calDateJDN.toJDNPeriod();

            expect(period.periodStart).toEqual(2459289);
            expect(period.periodEnd).toEqual(2459289);
        });

        it('should create a JDN calendar date from a Knora date BCE with day precision in the Gregorian calendar', () => {
            const calDateJDN = service.createJDNCalendarDateFromKnoraDate(
                new KnoraDate('GREGORIAN', 'BCE', 1, 1, 1)
            );

            const period = calDateJDN.toJDNPeriod();

            expect(period.periodStart).toEqual(1721058);
            expect(period.periodEnd).toEqual(1721058);
        });

        it('should create a JDN calendar date from a Knora date with day precision in the Julian calendar', () => {
            const calDateJDN = service.createJDNCalendarDateFromKnoraDate(
                new KnoraDate('JULIAN', 'CE', 2021, 3, 15)
            );

            const period = calDateJDN.toJDNPeriod();

            expect(period.periodStart).toEqual(2459302);
            expect(period.periodEnd).toEqual(2459302);
        });

        it('should create a JDN calendar date from a Knora date with month precision in the Gregorian calendar', () => {
            const calDateJDN = service.createJDNCalendarDateFromKnoraDate(
                new KnoraDate('GREGORIAN', 'CE', 2021, 3)
            );

            const period = calDateJDN.toJDNPeriod();

            expect(period.periodStart).toEqual(2459275);
            expect(period.periodEnd).toEqual(2459305);
        });

        it('should create a JDN calendar date from a Knora date with year precision in the Gregorian calendar', () => {
            const calDateJDN = service.createJDNCalendarDateFromKnoraDate(
                new KnoraDate('GREGORIAN', 'CE', 2021)
            );

            const period = calDateJDN.toJDNPeriod();

            expect(period.periodStart).toEqual(2459216);
            expect(period.periodEnd).toEqual(2459580);
        });
    });

    describe('convertHistoricalYearToAstronomicalYear', () => {
        it('should convert the year 1 BCE to its astronomical representation', () => {
            expect(
                service.convertHistoricalYearToAstronomicalYear(
                    1,
                    'BCE'
                )
            ).toEqual(0);
        });

        it('should convert the year 2 BCE to its astronomical representation', () => {
            expect(
                service.convertHistoricalYearToAstronomicalYear(
                    2,
                    'BCE'
                )
            ).toEqual(-1);
        });

        it('should convert the year 1 CE to its astronomical representation', () => {
            expect(
                service.convertHistoricalYearToAstronomicalYear(
                    1,
                    'CE'
                )
            ).toEqual(1);
        });

        it('should convert the year 1 in the Islamic to its astronomical representation', () => {
            expect(
                service.convertHistoricalYearToAstronomicalYear(
                    1,
                    'noEra'
                )
            ).toEqual(1);
        });
    });
});
