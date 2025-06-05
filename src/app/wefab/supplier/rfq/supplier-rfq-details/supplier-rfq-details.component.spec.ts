import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRfqDetailsComponent } from './supplier-rfq-details.component';

describe('SupplierRfqDetailsComponent', () => {
  let component: SupplierRfqDetailsComponent;
  let fixture: ComponentFixture<SupplierRfqDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierRfqDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierRfqDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
