import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedRfqComponent } from './submitted-rfq.component';

describe('SubmittedRfqComponent', () => {
  let component: SubmittedRfqComponent;
  let fixture: ComponentFixture<SubmittedRfqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedRfqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmittedRfqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
