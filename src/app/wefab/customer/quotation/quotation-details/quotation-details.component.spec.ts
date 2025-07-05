import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationDetailsComponent } from './quotation-details.component';

describe('QuotationDetailsComponent', () => {
  let component: QuotationDetailsComponent;
  let fixture: ComponentFixture<QuotationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuotationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
