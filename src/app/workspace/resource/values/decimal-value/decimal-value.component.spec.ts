import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalValueComponent } from './decimal-value.component';
import { ReadDecimalValue, MockResource, UpdateValue, UpdateDecimalValue, CreateDecimalValue } from '@dasch-swiss/dsp-js';
import { OnInit, Component, ViewChild, DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { $ } from 'protractor';
import { By } from '@angular/platform-browser';

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
    <app-decimal-value #inputVal [displayValue]="displayInputVal" [mode]="mode"></app-decimal-value>`
})
class TestHostDisplayValueComponent implements OnInit {

    @ViewChild('inputVal') inputValueComponent: DecimalValueComponent;

    displayInputVal: ReadDecimalValue;

    mode: 'read' | 'update' | 'create' | 'search';

    ngOnInit() {

        MockResource.getTestThing().subscribe(res => {
            const inputVal: ReadDecimalValue =
        res.getValuesAs('http://0.0.0.0:3333/ontology/0001/anything/v2#hasDecimal', ReadDecimalValue)[0];

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
    <app-decimal-value #inputVal [mode]="mode"></app-decimal-value>`
})
class TestHostCreateValueComponent implements OnInit {

    @ViewChild('inputVal') inputValueComponent: DecimalValueComponent;

    mode: 'read' | 'update' | 'create' | 'search';

    ngOnInit() {

        this.mode = 'create';

    }
}

describe('DecimalValueComponent', () => {

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                DecimalValueComponent,
                TestHostDisplayValueComponent,
                TestHostCreateValueComponent
            ],
            imports: [
                ReactiveFormsModule,
                MatInputModule,
                BrowserAnimationsModule
            ],
        })
            .compileComponents();
    }));

    describe('display and edit a decimal value', () => {
        let testHostComponent: TestHostDisplayValueComponent;
        let testHostFixture: ComponentFixture<TestHostDisplayValueComponent>;
        let valueComponentDe: DebugElement;
        let valueInputDebugElement: DebugElement;
        let valueInputNativeElement;
        let valueReadModeDebugElement: DebugElement;
        let valueReadModeNativeElement;
        let commentInputDebugElement: DebugElement;
        let commentInputNativeElement;

        beforeEach(() => {
            testHostFixture = TestBed.createComponent(TestHostDisplayValueComponent);
            testHostComponent = testHostFixture.componentInstance;
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
            expect(testHostComponent.inputValueComponent).toBeTruthy();

            const hostCompDe = testHostFixture.debugElement;
            valueComponentDe = hostCompDe.query(By.directive(DecimalValueComponent));

            valueReadModeDebugElement = valueComponentDe.query(By.css('.rm-value'));
            valueReadModeNativeElement = valueReadModeDebugElement.nativeElement;


        });

        it('should display an existing value', () => {

            expect(testHostComponent.inputValueComponent.displayValue.decimal).toEqual(1.5);

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            expect(testHostComponent.inputValueComponent.mode).toEqual('read');

            expect(valueReadModeNativeElement.innerText).toEqual('1.5');
        });

        it('should make an existing value editable', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            valueInputDebugElement = valueComponentDe.query(By.css('input.value'));
            valueInputNativeElement = valueInputDebugElement.nativeElement;

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(valueInputNativeElement.value).toEqual('1.5');

            valueInputNativeElement.value = '40.09';

            valueInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            const updatedValue = testHostComponent.inputValueComponent.getUpdatedValue();

            expect(updatedValue instanceof UpdateDecimalValue).toBeTruthy();

            expect((updatedValue as UpdateDecimalValue).decimal).toEqual(40.09);

        });

        it('should validate an existing value with an added comment', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            valueInputDebugElement = valueComponentDe.query(By.css('input.value'));
            valueInputNativeElement = valueInputDebugElement.nativeElement;

            commentInputDebugElement = valueComponentDe.query(By.css('textarea.comment'));
            commentInputNativeElement = commentInputDebugElement.nativeElement;

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(valueInputNativeElement.value).toEqual('1.5');

            commentInputNativeElement.value = 'this is a comment';

            commentInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            const updatedValue = testHostComponent.inputValueComponent.getUpdatedValue();

            expect(updatedValue instanceof UpdateDecimalValue).toBeTruthy();

            expect((updatedValue as UpdateDecimalValue).valueHasComment).toEqual('this is a comment');

        });

        it('should not return an invalid update value', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            valueInputDebugElement = valueComponentDe.query(By.css('input.value'));
            valueInputNativeElement = valueInputDebugElement.nativeElement;

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(valueInputNativeElement.value).toEqual('1.5');

            valueInputNativeElement.value = '.';

            valueInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            const updatedValue = testHostComponent.inputValueComponent.getUpdatedValue();

            expect(updatedValue).toBeFalsy();

        });

        it('should restore the initially displayed value', () => {

            testHostComponent.mode = 'update';

            testHostFixture.detectChanges();

            valueInputDebugElement = valueComponentDe.query(By.css('input.value'));
            valueInputNativeElement = valueInputDebugElement.nativeElement;

            expect(testHostComponent.inputValueComponent.mode).toEqual('update');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(valueInputNativeElement.value).toEqual('1.5');

            valueInputNativeElement.value = '40.09';

            valueInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            testHostComponent.inputValueComponent.resetFormControl();

            expect(valueReadModeNativeElement.innerText).toEqual('1.5');

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

        });

        it('should set a new display value', () => {

            const newDecimal = new ReadDecimalValue();

            newDecimal.decimal = 40.09;
            newDecimal.id = 'updatedId';

            testHostComponent.displayInputVal = newDecimal;

            testHostFixture.detectChanges();

            expect(valueReadModeNativeElement.innerText).toEqual('40.09');

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

        });

        it('should unsubscribe when destroyed', () => {
            expect(testHostComponent.inputValueComponent.valueChangesSubscription.closed).toBeFalsy();

            testHostComponent.inputValueComponent.ngOnDestroy();

            expect(testHostComponent.inputValueComponent.valueChangesSubscription.closed).toBeTruthy();
        });
    });

    describe('create a decimal value', () => {

        let testHostComponent: TestHostCreateValueComponent;
        let testHostFixture: ComponentFixture<TestHostCreateValueComponent>;
        let valueComponentDe: DebugElement;
        let valueInputDebugElement: DebugElement;
        let valueInputNativeElement;
        let commentInputDebugElement: DebugElement;
        let commentInputNativeElement;

        beforeEach(() => {
            testHostFixture = TestBed.createComponent(TestHostCreateValueComponent);
            testHostComponent = testHostFixture.componentInstance;
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
            expect(testHostComponent.inputValueComponent).toBeTruthy();

            const hostCompDe = testHostFixture.debugElement;

            valueComponentDe = hostCompDe.query(By.directive(DecimalValueComponent));
            valueInputDebugElement = valueComponentDe.query(By.css('input.value'));
            valueInputNativeElement = valueInputDebugElement.nativeElement;

            commentInputDebugElement = valueComponentDe.query(By.css('textarea.comment'));
            commentInputNativeElement = commentInputDebugElement.nativeElement;

            expect(testHostComponent.inputValueComponent.displayValue).toEqual(undefined);
            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();
            expect(valueInputNativeElement.value).toEqual('');
            expect(commentInputNativeElement.value).toEqual('');
        });

        it('should create a value', () => {
            valueInputNativeElement.value = '40.09';

            valueInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('create');

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            const newValue = testHostComponent.inputValueComponent.getNewValue();

            expect(newValue instanceof CreateDecimalValue).toBeTruthy();

            expect((newValue as CreateDecimalValue).decimal).toEqual(40.09);
        });

        it('should reset form after cancellation', () => {
            valueInputNativeElement.value = '40.09';

            valueInputNativeElement.dispatchEvent(new Event('input'));

            commentInputNativeElement.value = 'created comment';

            commentInputNativeElement.dispatchEvent(new Event('input'));

            testHostFixture.detectChanges();

            expect(testHostComponent.inputValueComponent.mode).toEqual('create');

            expect(testHostComponent.inputValueComponent.form.valid).toBeTruthy();

            testHostComponent.inputValueComponent.resetFormControl();

            expect(testHostComponent.inputValueComponent.form.valid).toBeFalsy();

            expect(valueInputNativeElement.value).toEqual('');

            expect(commentInputNativeElement.value).toEqual('');

        });
    });
});
