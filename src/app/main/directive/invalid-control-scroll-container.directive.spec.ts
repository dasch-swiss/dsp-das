import { Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvalidControlScrollContainerDirective } from './invalid-control-scroll-container.directive';
import { InvalidControlScrollDirective } from './invalid-control-scroll.directive';

@Component({
    template: `
    <div class="form-wrapper" appInvalidControlScrollContainer>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" appInvalidControlScroll>
            <div class="form-group">
                <label for="control1">Field 1</label>
                <input class="form-control" formControlName="control1"/>
            </div>
            <div class="form-group">
                <label for="control1">Field 2</label>
                <input class="form-control" formControlName="control2"/>
            </div>
            <div class="form-group">
                <label for="control1">Field 3</label>
                <input class="form-control" formControlName="control3"/>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
            </form>
    </div>
        `
})
class TestLinkHostComponent implements OnInit {

    form: FormGroup;

    constructor() { }

    ngOnInit() {
        this.form = new FormGroup({
            control1: new FormControl(),
            control2: new FormControl(),
            control3: new FormControl()
         });
    }

    onSubmit() {
        console.log('form submitted');
    }
}

describe('InvalidControlScrollContainerDirective', () => {

    let testHostComponent: TestLinkHostComponent;
    let testHostFixture: ComponentFixture<TestLinkHostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                InvalidControlScrollContainerDirective,
                InvalidControlScrollDirective,
                TestLinkHostComponent
            ],
            imports: [
                ReactiveFormsModule
            ]
        });

        testHostFixture = TestBed.createComponent(TestLinkHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        expect(testHostComponent).toBeTruthy();

    });

    it('should create an instance', () => {
        expect(testHostComponent).toBeTruthy();
    });
});
