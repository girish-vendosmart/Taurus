import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierOnboardingWelcomeComponentComponent } from './supplier-onboarding-welcome-component.component';

describe('SupplierOnboardingWelcomeComponentComponent', () => {
  let component: SupplierOnboardingWelcomeComponentComponent;
  let fixture: ComponentFixture<SupplierOnboardingWelcomeComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierOnboardingWelcomeComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierOnboardingWelcomeComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
