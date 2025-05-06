import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierCreateAccountComponent } from './supplier-create-account.component';

describe('SupplierCreateAccountComponent', () => {
  let component: SupplierCreateAccountComponent;
  let fixture: ComponentFixture<SupplierCreateAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierCreateAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierCreateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
