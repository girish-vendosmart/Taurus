import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerloginComponentComponent } from './buyerlogin-component.component';

describe('BuyerloginComponentComponent', () => {
  let component: BuyerloginComponentComponent;
  let fixture: ComponentFixture<BuyerloginComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyerloginComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuyerloginComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
