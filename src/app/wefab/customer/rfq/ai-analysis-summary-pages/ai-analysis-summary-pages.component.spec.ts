import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAnalysisSummaryPagesComponent } from './ai-analysis-summary-pages.component';

describe('AiAnalysisSummaryPagesComponent', () => {
  let component: AiAnalysisSummaryPagesComponent;
  let fixture: ComponentFixture<AiAnalysisSummaryPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAnalysisSummaryPagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiAnalysisSummaryPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
