import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFinderComponent } from './supplier-finder.component';

describe('SupplierFinderComponent', () => {
  let component: SupplierFinderComponent;
  let fixture: ComponentFixture<SupplierFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierFinderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
