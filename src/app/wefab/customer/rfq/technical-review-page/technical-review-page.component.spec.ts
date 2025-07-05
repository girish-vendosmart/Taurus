import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalReviewPageComponent } from './technical-review-page.component';

describe('TechnicalReviewPageComponent', () => {
  let component: TechnicalReviewPageComponent;
  let fixture: ComponentFixture<TechnicalReviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalReviewPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnicalReviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
