import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervalValueComponent } from './interval-value.component';
import { Component, DebugElement, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { CreateIntervalValue, MockResource, ReadIntervalValue, UpdateIntervalValue } from '@dasch-swiss/dsp-js';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { Interval } from './interval-input/interval-input.component';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
    selector: 'app-interval-input',
    template: '',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => TestIntervalInputComponent),
        },
        { provide: MatFormFieldControl, useExisting: TestIntervalInputComponent }
    ]
})
class TestIntervalInputComponent implements ControlValueAccessor, MatFormFieldControl<any> {

    @Input() value;
    @Input() disabled: boolean;
    @Input() empty: boolean;
    @Input() placeholder: string;
    @Input() required: boolean;
    @Input() shouldLabelFloat: boolean;
    @Input() errorStateMatcher: ErrorStateMatcher;
    @Input() valueRequiredValidator = true;

    stateChanges = new Subject<void>();
    errorState = false;
    focused = false;
    id = 'testid';
    ngControl: NgControl | null;
    onChange = (_: any) => {
    };

    writeValue(interval: Interval | null): void {
        this.value = interval;
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

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
    <app-interval-value #inputVal [displayValue]="displayInputVal" [mode]="mode"></app-interval-value>`
})
class TestHostDisplayValueComponent implements OnInit {

    @ViewChild('inputVal') inputValueComponent: IntervalValueComponent;

    displayInputVal: ReadIntervalValue;

    mode: 'read' | 'update' | 'create' | 'search';

    ngOnInit() {

        MockResource.getTestThing().subscribe(res => {
            const inputVal: ReadIntervalValue =
                res.getValuesAs('http://0.0.0.0:3333/ontology/0001/anything/v2#hasInterval', ReadIntervalValue)[0];

            this.displayInputVal = inputVal;

            this.mode = 'read';
        });

    }
}

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
    <app-interval-value #inputVal [mode]="mode"></app-interval-value>`
})
class TestHostCreateValueComponent implements OnInit {

    @ViewChild('inputVal') inputValueComponent: IntervalValueComponent;

    mode: 'read' | 'update' | 'create' | 'search';

    ngOnInit() {

        this.mode = 'create';
    }
}

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
    <app-interval-value #inputVal [mode]="mode" [valueRequiredValidator]="false"></app-interval-value>`
})
class TestHostCreateValueNoValueRequiredComponent implements OnInit {

    @ViewChild('inputVal') inputValueComponent: IntervalValueComponent;

    mode: 'read' | 'update' | 'create' | 'search';

    ngOnInit() {

        this.mode = 'create';
    }
}


describe('IntervalValueComponent', () => {

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IntervalValueComponent,
                TestHostDisplayValueComponent,
                TestIntervalInputComponent,
                TestHostCreateValueComponent,
                TestHostCreateValueNoValueRequiredComponent
            ],
            imports: [
                ReactiveFormsModule,
                MatInputModule,
                BrowserAnimationsModule
            ],
        })
            .compileComponents();
    }));

    describe('display and edit an interval value', () => {
        let testHostComponent: TestHostDisplayValueComponent;
        let testHostFixture: ComponentFixture<TestHostDisplayValueComponent>;

        let valueComponentDe: DebugElement;
        let intervalStartReadModeDebugElement: DebugElement;
        let intervalEndReadModeDebugElement: DebugElement;
        let intervalStartReadModeNativeElement;
        let intervalEndReadModeNativeElement;
        let commentInputDebugElement: DebugElement;
        let commentInputNativeElement;

        beforeEach(() => {
            testHostFixture = TestBed.createComponent(TestHostDisplayValueComponent);
            testHostComponent = testHostFixture.componentInstance;
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
            expect(testHostComponent.inputValueComponent).toBeTruthy();

            const hostCompDe = testHostFixture.debugElement;

            valueComponentDe = hostCompDe.query(By.directive(IntervalValueComponent));
            intervalStartReadModeDebugElement = valueComponentDe.query(By.css('.rm-value.interval-start'));
            intervalStartReadModeNativeElement = intervalStartReadModeDebugElement.nativeElement;

            intervalEndReadModeDebugElement = valueComponentDe.query(By.css('.rm-value.interval-end'));
            intervalEndReadModeNativeElement = intervalEndReadModeDebugElement.nativeElement;
        });

        it('should display an existing value', () => {

            expect(testHostComponent.inputValueComponent.displayValue.start).toEqual(0);

            expect(testHostComponent.inputValueComponent.displayValue.end).toEqual(216000);

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            expect(testHostComponent.inputValueComponent.mode).toEqual('read');

            expect(intervalStartReadModeNativeElement.innerText).toEqual('Start: 0');

            expect(intervalEndReadModeNativeElement.innerText).toEqual('End: 216000');

        });

        it('should make an existing value editable', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(testHostComponent.inputValueComponent.intervalInputComponent.value.start).toEqual(0);

            expect(testHostComponent.inputValueComponent.intervalInputComponent.value.end).toEqual(216000);

            // simulate user input
            const newInterval = {
                start: 100,
                end: 200
            };

            testHostComponent.inputValueComponent.intervalInputComponent.value = newInterval;
            testHostComponent.inputValueComponent.intervalInputComponent._handleInput();

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.valueFormControl.value).toBeTruthy();

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            const updatedValue = testHostComponent.inputValueComponent.getUpdatedValue();

            expect(updatedValue instanceof UpdateIntervalValue).toBeTruthy();

            expect((updatedValue as UpdateIntervalValue).start).toEqual(100);
            expect((updatedValue as UpdateIntervalValue).end).toEqual(200);

        });

        it('should compare the existing version of an interval to the user input', () => {

            // interval 0, 216000
            const initValue: Interval = testHostComponent.inputValueComponent.getInitValue();

            expect(
                testHostComponent.inputValueComponent.standardValueComparisonFunc(
                    initValue, new Interval(0, 216000)
                )
            ).toBeTruthy();

            expect(
                testHostComponent.inputValueComponent.standardValueComparisonFunc(
                    initValue, new Interval(1, 216000)
                )
            ).toBeFalsy();

            expect(
                testHostComponent.inputValueComponent.standardValueComparisonFunc(
                    initValue, new Interval(2, 21)
                )
            ).toBeFalsy();

            expect(
                testHostComponent.inputValueComponent.standardValueComparisonFunc(
                    initValue, new Interval(0, 21600)
                )
            ).toBeFalsy();

            expect(
                testHostComponent.inputValueComponent.standardValueComparisonFunc(
                    initValue, null
                )
            ).toBeFalsy();



        });

        it('should validate an existing value with an added comment', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            commentInputDebugElement = valueComponentDe.query(By.css('textarea.comment'));
            commentInputNativeElement = commentInputDebugElement.nativeElement;

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.displayValue.start).toEqual(0);

            expect(testHostComponent.inputValueComponent.displayValue.end).toEqual(216000);

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            commentInputNativeElement.value = 'this is a comment';

            commentInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            const updatedValue = testHostComponent.inputValueComponent.getUpdatedValue();

            expect(updatedValue instanceof UpdateIntervalValue).toBeTruthy();

            expect((updatedValue as UpdateIntervalValue).valueHasComment).toEqual('this is a comment');

        });

        it('should not return an invalid update value', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            testHostComponent.inputValueComponent.intervalInputComponent.value = null;
            testHostComponent.inputValueComponent.intervalInputComponent._handleInput();

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            const updatedValue = testHostComponent.inputValueComponent.getUpdatedValue();

            expect(updatedValue).toBeFalsy();

        });

        it('should restore the initially displayed value', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            // simulate user input
            const newInterval = {
                start: 100,
                end: 200
            };

            testHostComponent.inputValueComponent.intervalInputComponent.value = newInterval;
            testHostComponent.inputValueComponent.intervalInputComponent._handleInput();

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.valueFormControl.value.start).toEqual(100);

            expect(testHostComponent.inputValueComponent.valueFormControl.value.end).toEqual(200);

            testHostComponent.inputValueComponent.resetFormControl();

            expect(testHostComponent.inputValueComponent.intervalInputComponent.value.start).toEqual(0);

            expect(testHostComponent.inputValueComponent.intervalInputComponent.value.end).toEqual(216000);

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

        });

        it('should set a new display value', () => {

            const newInterval = new ReadIntervalValue();

            newInterval.start = 300;
            newInterval.end = 500;
            newInterval.id = 'updatedId';

            testHostComponent.displayInputVal = newInterval;

            testHostFixture.detectChanges();

            expect(intervalStartReadModeNativeElement.innerText).toEqual('Start: 300');

            expect(intervalEndReadModeNativeElement.innerText).toEqual('End: 500');

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

        });

        it('should unsubscribe when destroyed', () => {
            expect(testHostComponent.inputValueComponent.valueChangesSubscription.closed).toBeFalsy();

            testHostComponent.inputValueComponent.ngOnDestroy();

            expect(testHostComponent.inputValueComponent.valueChangesSubscription.closed).toBeTruthy();
        });

    });

    describe('create an interval value', () => {

        let testHostComponent: TestHostCreateValueComponent;
        let testHostFixture: ComponentFixture<TestHostCreateValueComponent>;

        let valueComponentDe: DebugElement;
        let commentInputDebugElement: DebugElement;
        let commentInputNativeElement;

        beforeEach(() => {
            testHostFixture = TestBed.createComponent(TestHostCreateValueComponent);
            testHostComponent = testHostFixture.componentInstance;
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
            expect(testHostComponent.inputValueComponent).toBeTruthy();

            const hostCompDe = testHostFixture.debugElement;

            valueComponentDe = hostCompDe.query(By.directive(IntervalValueComponent));
            commentInputDebugElement = valueComponentDe.query(By.css('textarea.comment'));
            commentInputNativeElement = commentInputDebugElement.nativeElement;
        });

        it('should create a value', () => {

            expect(testHostComponent.inputValueComponent.intervalInputComponent.value).toEqual(null);

            // simulate user input
            const newInterval = {
                start: 100,
                end: 200
            };

            testHostComponent.inputValueComponent.intervalInputComponent.value = newInterval;
            testHostComponent.inputValueComponent.intervalInputComponent._handleInput();

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('create');

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            const newValue = testHostComponent.inputValueComponent.getNewValue();

            expect(newValue instanceof CreateIntervalValue).toBeTruthy();

            expect((newValue as CreateIntervalValue).start).toEqual(100);
            expect((newValue as CreateIntervalValue).end).toEqual(200);
        });

        it('should reset form after cancellation', () => {
            // simulate user input
            const newInterval = {
                start: 100,
                end: 200
            };

            testHostComponent.inputValueComponent.intervalInputComponent.value = newInterval;
            testHostComponent.inputValueComponent.intervalInputComponent._handleInput();

            testHostFixture.detectChanges();

            commentInputNativeElement.value = 'created comment';

            commentInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('create');

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            testHostComponent.inputValueComponent.resetFormControl();

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(testHostComponent.inputValueComponent.intervalInputComponent.value).toEqual(null);

            expect(commentInputNativeElement.value).toEqual('');

        });

    });

    describe('create an interval value no value required', () => {

        let testHostComponent: TestHostCreateValueNoValueRequiredComponent;
        let testHostFixture: ComponentFixture<TestHostCreateValueNoValueRequiredComponent>;

        beforeEach(() => {
            testHostFixture = TestBed.createComponent(TestHostCreateValueNoValueRequiredComponent);
            testHostComponent = testHostFixture.componentInstance;
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
        });

        it('should not create an empty value', () => {
            expect(testHostComponent.inputValueComponent.getNewValue()).toBe(false);
            expect(testHostComponent.inputValueComponent.form.valid).toBe(true);
        });

        it('should propagate valueRequiredValidator to child component', () => {
            expect(testHostComponent.inputValueComponent.valueRequiredValidator).toBe(false);
        });

    });
});
