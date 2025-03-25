import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VreResourceEditorPropertiesDisplayComponent } from './vre-resource-editor-properties-display.component';

describe('VreResourceEditorPropertiesDisplayComponent', () => {
  let component: VreResourceEditorPropertiesDisplayComponent;
  let fixture: ComponentFixture<VreResourceEditorPropertiesDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VreResourceEditorPropertiesDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VreResourceEditorPropertiesDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
