import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VideoPreviewComponent } from './video-preview.component';

describe('VideoPreviewComponent', () => {
  let component: VideoPreviewComponent;
  let fixture: ComponentFixture<VideoPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
