import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppStringLiteralComponent } from './dasch-swiss-string-literal.component';
import {DspApiConnectionToken} from "@dasch-swiss/vre/shared/app-config";
import {SessionService} from "@dasch-swiss/vre/shared/app-session";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatLegacyInputHarness as MatInputHarness} from "@angular/material/legacy-input/testing";
import {MatButtonHarness} from "@angular/material/button/testing";
import {By} from "@angular/platform-browser";
import {HarnessLoader} from "@angular/cdk/testing";
import {Component, DebugElement, OnInit, ViewChild} from "@angular/core";
import {StringLiteral} from "@dasch-swiss/dsp-js";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";


/**
 * test host component to simulate parent component.
 */
@Component({
    template: ` <dasch-swiss-app-string-literal
        #stringLiteralInputVal
        [placeholder]="'List label'"
        [value]="labels"
        [language]="language"
        [textarea]="isTextarea"
    >
    </dasch-swiss-app-string-literal>`,
})
class TestHostStringLiteralInputComponent implements OnInit {
    @ViewChild('stringLiteralInputVal')
    stringLiteralInputComponent!: AppStringLiteralComponent;

    labels: StringLiteral[] = [];

    language = 'en';

    isTextarea = false;

    ngOnInit() {
        this.labels = [
            {
                value: 'Welt',
                language: 'de',
            },
            {
                value: 'World',
                language: 'en',
            },
            {
                value: 'Monde',
                language: 'fr',
            },
            {
                value: 'Mondo',
                language: 'it',
            },
            {
                value: 'Mund',
                language: 'rm',
            },
        ];
    }
}

describe('AppStringLiteralComponent', () => {
    let testHostComponent: TestHostStringLiteralInputComponent;
    let testHostFixture: ComponentFixture<TestHostStringLiteralInputComponent>;
    let loader: HarnessLoader;

    let sliComponentDe: DebugElement;
    let sliMenuDebugElement: DebugElement;
    let sliMenuNativeElement;
    let langButton;

    beforeEach(async () => {
        // empty spy object to use in the providers for the SessionService injection
        const dspConnSpy = {};
        await TestBed.configureTestingModule({
            imports: [
                AppStringLiteralComponent,
                BrowserAnimationsModule
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpy,
                },
                SessionService,
            ],
        }).compileComponents();
    });


    beforeEach(() => {
        testHostFixture = TestBed.createComponent(
            TestHostStringLiteralInputComponent
        );
        testHostComponent = testHostFixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(testHostFixture);
        testHostFixture.detectChanges();
        expect(testHostComponent).toBeTruthy();
        expect(testHostComponent.stringLiteralInputComponent).toBeTruthy();
    });

    it('should create', () => {
        expect(testHostComponent.stringLiteralInputComponent).toBeTruthy();
    });


});
