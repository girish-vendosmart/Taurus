import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierOnboardingComponent } from './supplier-onboarding.component';

describe('SupplierOnboardingComponent', () => {
  let component: SupplierOnboardingComponent;
  let fixture: ComponentFixture<SupplierOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierOnboardingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
