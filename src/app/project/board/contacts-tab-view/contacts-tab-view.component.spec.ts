import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsTabViewComponent } from './contacts-tab-view.component';

describe('ContactsTabViewComponent', () => {
  let component: ContactsTabViewComponent;
  let fixture: ComponentFixture<ContactsTabViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsTabViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
