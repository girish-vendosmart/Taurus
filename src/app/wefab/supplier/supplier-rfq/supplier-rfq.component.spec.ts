import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRfqComponent } from './supplier-rfq.component';

describe('SupplierRfqComponent', () => {
  let component: SupplierRfqComponent;
  let fixture: ComponentFixture<SupplierRfqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierRfqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierRfqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
