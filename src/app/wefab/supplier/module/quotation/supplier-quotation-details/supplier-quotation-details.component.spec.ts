import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierQuotationDetailsComponent } from './supplier-quotation-details.component';

describe('SupplierQuotationDetailsComponent', () => {
  let component: SupplierQuotationDetailsComponent;
  let fixture: ComponentFixture<SupplierQuotationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierQuotationDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierQuotationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
