import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierOnboardingStatusComponent } from './supplier-onboarding-status.component';

describe('SupplierOnboardingStatusComponent', () => {
  let component: SupplierOnboardingStatusComponent;
  let fixture: ComponentFixture<SupplierOnboardingStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierOnboardingStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierOnboardingStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
