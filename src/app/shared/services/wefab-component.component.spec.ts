import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WefabComponentComponent } from '../../wefab/wefab-component.component';

describe('WefabComponentComponent', () => {
  let component: WefabComponentComponent;
  let fixture: ComponentFixture<WefabComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WefabComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WefabComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
