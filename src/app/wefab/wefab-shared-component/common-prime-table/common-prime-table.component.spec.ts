import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonPrimeTableComponent } from './common-prime-table.component';

describe('CommonPrimeTableComponent', () => {
  let component: CommonPrimeTableComponent;
  let fixture: ComponentFixture<CommonPrimeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonPrimeTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommonPrimeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
