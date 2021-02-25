import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPermissionComponent } from './display-permission.component';
import { Component } from '@angular/core';

@Component({
    template: `<app-display-permission [displayPermission]="'RV'"></app-display-permission>`
})
class TestParentComponent {

}

describe('DisplayPermissionComponent', () => {
    let testHostComponent: TestParentComponent;
    let testHostFixture: ComponentFixture<TestParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
          DisplayPermissionComponent,
          TestParentComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
      testHostFixture = TestBed.createComponent(TestParentComponent);
      testHostComponent = testHostFixture.componentInstance;
      testHostFixture.detectChanges();

      expect(testHostComponent).toBeTruthy();
  });

  it('should create', () => {
    expect(testHostComponent).toBeTruthy();
  });
});
