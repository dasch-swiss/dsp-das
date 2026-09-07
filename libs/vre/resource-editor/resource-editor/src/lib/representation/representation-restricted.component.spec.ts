import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { RepresentationRestrictedComponent } from './representation-restricted.component';

describe('RepresentationRestrictedComponent', () => {
  let component: RepresentationRestrictedComponent;
  let fixture: ComponentFixture<RepresentationRestrictedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepresentationRestrictedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(RepresentationRestrictedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
