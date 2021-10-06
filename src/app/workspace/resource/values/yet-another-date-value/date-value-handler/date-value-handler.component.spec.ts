import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR,
    NgControl,
    ReactiveFormsModule
} from '@angular/forms';
import { KnoraDate, KnoraPeriod } from '@dasch-swiss/dsp-js';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ErrorStateMatcher, MatOptionModule } from '@angular/material/core';
import { Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { DateValueHandlerComponent } from './date-value-handler.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
        <div [formGroup]="form">
            <mat-form-field>
                <app-date-value-handler #dateValueHandler [formControlName]="'date'"></app-date-value-handler>
            </mat-form-field>
        </div>`
})
class TestHostComponent implements OnInit {

    @ViewChild('dateValueHandler') dateValueHandlerComponent: DateValueHandlerComponent;

    form: FormGroup;

    constructor(private _fb: FormBuilder) {
    }

    ngOnInit(): void {

        this.form = this._fb.group({
            date: [new KnoraDate('JULIAN', 'CE', 2018, 5, 19)]
        });

    }
}

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
        <div [formGroup]="form">
            <mat-form-field>
                <app-date-value-handler #dateValueHandler [formControlName]="'date'"
                                     [valueRequiredValidator]="false"></app-date-value-handler>
            </mat-form-field>
        </div>`
})
class NoValueRequiredTestHostComponent implements OnInit {

    @ViewChild('dateValueHandler') dateValueHandlerComponent: DateValueHandlerComponent;

    form: FormGroup;

    constructor(private _fb: FormBuilder) {
    }

    ngOnInit(): void {

        this.form = this._fb.group({
            date: new FormControl(null)
        });

    }
}

@Component({
    selector: 'app-date-picker',
    template: '',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => TestDatePickerComponent),
        },
        { provide: MatFormFieldControl, useExisting: TestDatePickerComponent }
    ]
})

class TestDatePickerComponent implements ControlValueAccessor, MatFormFieldControl<any> {

    @Input() value;
    @Input() disabled: boolean;
    @Input() empty: boolean;
    @Input() placeholder: string;
    @Input() required: boolean;
    @Input() shouldLabelFloat: boolean;
    @Input() errorStateMatcher: ErrorStateMatcher;
    @Input() valueRequiredValidator = true;

    @Input() calendar: string;
    stateChanges = new Subject<void>();

    errorState = false;
    focused = false;
    id = 'testid';
    ngControl: NgControl | null;
    onChange = (_: any) => { };


    writeValue(date: KnoraDate | null): void {
        this.value = date;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    onContainerClick(event: MouseEvent): void {
    }

    setDescribedByIds(ids: string[]): void {
    }

    _handleInput(): void {
        this.onChange(this.value);
    }

}

describe('DateValueHandlerComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                DateValueHandlerComponent,
                TestDatePickerComponent,
                TestHostComponent
            ],
            imports: [
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatIconModule,
                BrowserAnimationsModule
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(testHostFixture);
        testHostFixture.detectChanges();

        expect(testHostComponent).toBeTruthy();
    });

    it('should initialize a date correctly', async () => {

        expect(testHostComponent.dateValueHandlerComponent.startDate.value).toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));

        expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeFalse();

        expect(testHostComponent.dateValueHandlerComponent.endDate.value).toBeNull();

        const hostCompDe = testHostFixture.debugElement;
        const datePickerComponentDe = hostCompDe.query(By.directive(TestDatePickerComponent));

        expect((datePickerComponentDe.componentInstance as TestDatePickerComponent).value).toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));

        expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

        expect(testHostComponent.dateValueHandlerComponent.value instanceof KnoraDate).toBe(true);

        expect(testHostComponent.dateValueHandlerComponent.value)
            .toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));

    });

    it('should initialize a period correctly', async () => {

        testHostComponent.form.controls.date.setValue(new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2018, 5, 19), new KnoraDate('JULIAN', 'CE', 2019, 5, 19)));

        expect(testHostComponent.dateValueHandlerComponent.calendarControl.value).toEqual('JULIAN');

        expect(testHostComponent.dateValueHandlerComponent.startDate.value).toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));

        expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeTrue();

        expect(testHostComponent.dateValueHandlerComponent.endDate.value).toEqual(new KnoraDate('JULIAN', 'CE', 2019, 5, 19));

        testHostFixture.detectChanges();

        const hostCompDe = testHostFixture.debugElement;

        const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

        const endDateEditComponentDe = hostCompDe.query(By.css('.end-date'));

        expect((startDateEditComponentDe.componentInstance as TestDatePickerComponent).value).toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));

        expect((endDateEditComponentDe.componentInstance as TestDatePickerComponent).value).toEqual(new KnoraDate('JULIAN', 'CE', 2019, 5, 19));

        expect(testHostComponent.dateValueHandlerComponent.form.valid).toBe(true);

        expect(testHostComponent.dateValueHandlerComponent.value instanceof KnoraPeriod).toBe(true);

        expect(testHostComponent.dateValueHandlerComponent.value)
            .toEqual(new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2018, 5, 19), new KnoraDate('JULIAN', 'CE', 2019, 5, 19)));

    });

    it('should react correctly to changing the calendar for a period', () => {

        testHostComponent.form.controls.date.setValue(new KnoraPeriod(new KnoraDate('JULIAN', 'CE', 2018, 5, 19), new KnoraDate('JULIAN', 'CE', 2019, 5, 19)));

        // expect(testHostComponent.dateValueHandlerComponent.calendarControl.value).toEqual('JULIAN');

        expect(testHostComponent.dateValueHandlerComponent.startDate.value).toEqual(new KnoraDate('JULIAN', 'CE', 2018, 5, 19));

        expect(testHostComponent.dateValueHandlerComponent.isPeriodControl.value).toBeTrue();

        expect(testHostComponent.dateValueHandlerComponent.endDate.value).toEqual(new KnoraDate('JULIAN', 'CE', 2019, 5, 19));

        testHostFixture.detectChanges();

        const hostCompDe = testHostFixture.debugElement;

        const startDateEditComponentDe = hostCompDe.query(By.css('.start-date'));

        expect((startDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('JULIAN');

        const endDateEditComponentDe = hostCompDe.query(By.css('.end-date'));

        expect((endDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('JULIAN');

        testHostComponent.dateValueHandlerComponent.startDate.setValue(new KnoraDate('GREGORIAN', 'CE', 2018, 5, 19));

        testHostFixture.detectChanges();

        expect((startDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('GREGORIAN');

        expect((endDateEditComponentDe.componentInstance as TestDatePickerComponent).value.calendar).toEqual('GREGORIAN');

    });
});
