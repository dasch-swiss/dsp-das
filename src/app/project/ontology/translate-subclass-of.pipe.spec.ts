import { TranslateSubclassOfPipe } from './translate-subclass-of.pipe';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('TranslateSubclassOfPipe', () => {
    let pipe: TranslateSubclassOfPipe;
    let subClass: string;

    beforeEach(() => {
        pipe = new TranslateSubclassOfPipe();
        subClass = 'http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation';
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should display "Still Image" from <http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation>', () => {
        const defaultClassLabel = pipe.transform(subClass);
        expect(defaultClassLabel).toEqual('Still Image');
    });

    it('should display "Still Image" in the template', () => {
        @Component({
          template: `{{ subClassOf | translateSubclassOf }}`,
        })
        class App {
          subClassOf = 'http://api.knora.org/ontology/knora-api/v2#StillImageRepresentation';
        }

        TestBed.configureTestingModule({declarations: [App, TranslateSubclassOfPipe]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('Still Image');
    });

    it('should display "Type Thing" in the template', () => {
        @Component({
          template: `{{ subClassOf | translateSubclassOf }}`,
        })
        class App {
          subClassOf = 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing';
        }

        TestBed.configureTestingModule({declarations: [App, TranslateSubclassOfPipe]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('Type Thing');
    });


});
