import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierOnboardingComponentsTsComponent } from './supplier-onboarding.components.ts.component';

describe('SupplierOnboardingComponentsTsComponent', () => {
  let component: SupplierOnboardingComponentsTsComponent;
  let fixture: ComponentFixture<SupplierOnboardingComponentsTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierOnboardingComponentsTsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierOnboardingComponentsTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
