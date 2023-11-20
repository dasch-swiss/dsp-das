import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyFormValueComponent } from './property-form-value.component';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { AppDatePickerComponent } from '@dasch-swiss/vre/shared/app-date-picker';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';

@Component({
    template: ` <dasch-swiss-property-form-value
        [objectType]="objectType"
        [value]="value"
        (emitValueChanged)="emitValueChanged($event)"
    ></dasch-swiss-property-form-value>`,
})
class TestHostComponent {
    objectType: string | undefined = '';
    value: string | undefined = '';

    // emitValueChanged(value: string) {}

    // http://api.knora.org/ontology/knora-api/v2#DateValue

    changeObjectType(objectType: string) {
        this.objectType = objectType;
    }
}

describe('PropertyFormValueComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFormValueComponent, NoopAnimationsModule],
            declarations: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should show the datepicker', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#DateValue');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        expect(hostCompDe.query(By.directive(AppDatePickerComponent))).toBeTruthy();
    });

    it('should show the resource label input field', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#ResourceLabel');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        const formField = hostCompDe.query(By.directive(MatFormField));
        expect(formField).toBeTruthy();
        expect(formField.query(By.css('.resource-label-input'))).toBeTruthy();
    });

    it('should show the text value input field', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#TextValue');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        const formField = hostCompDe.query(By.directive(MatFormField));
        expect(formField).toBeTruthy();
        expect(formField.query(By.css('.text-value-input'))).toBeTruthy();
    });

    it('should show the boolean value mat-select', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#BooleanValue');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        const formField = hostCompDe.query(By.directive(MatFormField));
        expect(formField).toBeTruthy();
        expect(formField.query(By.directive(MatSelect))).toBeTruthy();
    });

    it('should show the uri value input field', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#UriValue');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        const formField = hostCompDe.query(By.directive(MatFormField));
        expect(formField).toBeTruthy();
        expect(formField.query(By.css('.uri-value-input'))).toBeTruthy();
    });

    it('should show the integer value input field', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#IntValue');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        const formField = hostCompDe.query(By.directive(MatFormField));
        expect(formField).toBeTruthy();
        expect(formField.query(By.css('.int-value-input'))).toBeTruthy();
    });

    it('should show the decimal value input field', () => {
        component.changeObjectType('http://api.knora.org/ontology/knora-api/v2#DecimalValue');
        fixture.detectChanges();
        const hostCompDe = fixture.debugElement;
        const formField = hostCompDe.query(By.directive(MatFormField));
        expect(formField).toBeTruthy();
        expect(formField.query(By.css('.decimal-value-input'))).toBeTruthy();
    });
});
