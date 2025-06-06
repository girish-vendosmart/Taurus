import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonCardComponent } from './common-card.component';

describe('CommonCardComponent', () => {
  let component: CommonCardComponent;
  let fixture: ComponentFixture<CommonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
