import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { KnoraDate } from '@dasch-swiss/dsp-js';
import { ValueService } from '../../../services/value.service';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

    @ViewChild(MatMenuTrigger) popover: MatMenuTrigger;

    date: KnoraDate;

    form: FormGroup;
    formErrors = {
        'year': ''
    };

    validationMessages = {
        'year': {
            'required': 'At least the year has to be set.',
            'min': 'A valid year is greater than 0.',
        }
    };

    // list of months
    months = [
        ['Jan', 'Muḥarram'],
        ['Feb', 'Safar'],
        ['Mar', 'Rabīʿ al-ʾAwwal'],
        ['Apr', 'Rabīʿ ath-Thānī'],
        ['May', 'Jumadā al-ʾŪlā'],
        ['Jun', 'Jumādā ath-Thāniyah'],
        ['Jul', 'Rajab'],
        ['Aug', 'Shaʿbān'],
        ['Sep', 'Ramaḍān'],
        ['Oct', 'Shawwāl'],
        ['Nov', 'Ḏū al-Qaʿdah'],
        ['Dec', 'Ḏū al-Ḥijjah']
    ];

    weekDays = [
        'M',
        'T',
        'W',
        'T',
        'F',
        'S',
        'S',
    ];

    weeks = [];
    days: number[] = [];
    selectedDay: number;

    disableDaySelector: boolean;

    calendars = [
        'Gregorian',
        'Julian',
        'Islamic'
    ];

    calendar: 'Gregorian' | 'Julian' | 'Islamic' = 'Gregorian';

    era: 'CE' | 'BCE' = 'CE';

    constructor(
        private _valueService: ValueService
    ) {
    }

    ngOnInit(): void {

        this.buildForm();

        // display current date;
        // --> TODO: replace by date value in case of existing one
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        this.selectedDay = today.getDate();

        this.form.controls.year.setValue(year);
        this.form.controls.month.setValue(month);
        this.form.controls.calendar.setValue(this.calendar);


        this.form.controls.era.setValue(this.era);

        this._setDays(this.calendar, this.era, year, month);

        this.form.valueChanges
            .subscribe(data => this.onValueChanged(data));
    }

    buildForm() {
        this. form = new FormGroup({
            calendar: new FormControl(''),
            era: new FormControl(''),
            year: new FormControl('', [
                Validators.required,
                Validators.min(1)
            ]),
            month: new FormControl('')
            // day: new FormControl('')
        });
    }

    /**
         * this method is for the form error handling
         *
         * @param data Data which changed.
         */
    onValueChanged(data?: any) {

        if (!this.form) {
            return;
        }

        this.calendar = this.form.controls.calendar.value;

        // islamic calendar doesn't have a "before common era"
        this.era = (this.calendar === 'Islamic' ? null : this.form.controls.era.value);

        if (data.year > 0) {
            if (data.month) {
                // give possibility to select day;
                this.disableDaySelector = false;
                // set the corresponding days
                this._setDays(this.calendar, this.era, data.year, data.month);
            } else {
                // set precision to year only; disable the day selector
                this.disableDaySelector = true;
                this.selectedDay = undefined;
                this.setDate();
            }
        } else {
            // not valid form; disable the day selector
            this.disableDaySelector = true;
            this.selectedDay = undefined;
        }

        const form = this.form;

        Object.keys(this.formErrors).map(field => {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.formErrors[field] += messages[key] + ' ';
                });

            }
        });
    }

    setDate(day?: number) {

        // set date on year, on year and month or on year, month and day precision
        if (this.form.controls.year.value > 0 && this.form.valid) {
            this.selectedDay = day;
            this.date = new KnoraDate(
                this.calendar.toUpperCase(),
                this.era,
                this.form.controls.year.value,
                this.form.controls.month.value ? this.form.controls.month.value : undefined,
                day ? day : undefined
            );

            this.popover.closeMenu();
        }
    }

    /**
     * sets available days for a given year and month.
     *
     * @param calendar calendar of the given date.
     * @param era era of the given date.
     * @param year year of the given date.
     * @param month month of the given date.
     */
    private _setDays(calendar: string, era: string, year: number, month: number) {

        const yearAstro = this._valueService.convertHistoricalYearToAstronomicalYear(year, era, calendar.toUpperCase());

        // count the days of the month
        let days = this._valueService.calculateDaysInMonth(calendar.toUpperCase(), yearAstro, month);

        // calculate the week day and the position of the first day of the month
        // if date is before October 4th 1582, we should use the julian date converter for week day
        let firstDayOfMonth: number;

        const h = (month <= 2 ? month + 12 : month );
        const k = (month <= 2 ? year - 1 : year);

        if(year < 1582 || (year === 1582 && month <= 10) || calendar === 'Julian') {
            // get the day of the week by using the julian date converter independet from selected calendar
            firstDayOfMonth = ( 1 + 2 * h + Math.floor((3 * h + 3) / 5) + k + Math.floor(k / 4) -1 ) % 7;
            // console.log(firstDayOfMonth);
        } else {
            // firstDayOfMonth = new Date(year, month - 1, 1).getDay();
            // console.log('firstDayOfMonth', firstDayOfMonth);
            firstDayOfMonth = (1 + 2 * h + Math.floor((3 * h + 3) / 5) + k + Math.floor(k / 4) - Math.floor(k / 100) + Math.floor(k / 400) + 1) % 7;
            // console.log('own greg formula', firstDayOfMonth);
        }

        // empty array of the days
        this.days = [];

        // if first day of the month is sunday (0)
        // move it to the end of the week (7)
        // because the first column is prepared for Monday
        if (firstDayOfMonth === 0) {
            firstDayOfMonth = 7;
        }

        // if era is not before common era, we support
        // week days. The following loop helps to set
        // position of the first day of the month
        if (era === 'CE') {
            for (let i = 1; i < firstDayOfMonth; i++) {
                this.days.push(0);
            }
        }

        // prepare list of the days
        for (let i = 1; i <= days; i++) {
            // special case for October 1582, which had only 21 days instead of 31
            // because of the change from julian to gregorian calendar
            if (calendar === 'Gregorian' && (year === 1582 && month === 10) && i === 5 && era === 'CE') {
                i = 15;
                days = 31;
            }
            this.days.push(i);
        }

        // split the list of the days in to
        // list of days per week corresponding to the week day
        const dates = this.days;
        const weeks = [];
        while (dates.length > 0) {
            weeks.push(dates.splice(0, 7));
        }
        this.weeks = weeks;

        // console.log(this.days)
        // console.log(this.weeks)
        // check if selected day is still valid, otherwise set to latest possible day
        // if (this.dayControl.value !== null && this.dayControl.value > this.days.length) {
        //     this.dayControl.setValue(this.days.length);
        // }
    }

}
