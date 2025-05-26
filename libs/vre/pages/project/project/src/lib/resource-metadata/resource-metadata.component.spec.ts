import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceMetadataComponent } from './resource-metadata.component';

describe('ResourceMetadataComponent', () => {
  let component: ResourceMetadataComponent;
  let fixture: ComponentFixture<ResourceMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceMetadataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
