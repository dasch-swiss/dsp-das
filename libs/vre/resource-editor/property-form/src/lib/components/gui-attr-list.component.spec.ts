import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { GuiAttrListComponent } from './gui-attr-list.component';

@Pipe({ name: 'humanReadableError' })
class MockHumanReadableErrorPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

describe('GuiAttrListComponent', () => {
  let component: GuiAttrListComponent;
  let fixture: ComponentFixture<GuiAttrListComponent>;
  let storeMock: any;

  beforeEach(async () => {
    storeMock = {
      select: jest.fn().mockReturnValue(
        of([
          { id: '1', labels: [{ value: 'List 1' }] },
          { id: '2', labels: [{ value: 'List 2' }] },
        ])
      ),
    };

    await TestBed.configureTestingModule({
      declarations: [GuiAttrListComponent, MockHumanReadableErrorPipe],
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatOptionModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GuiAttrListComponent);
    component = fixture.componentInstance;
    component.control = new FormControl<string>('sdf');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render list options', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('List 1');
    expect(compiled.textContent).toContain('List 2');
  });
});
