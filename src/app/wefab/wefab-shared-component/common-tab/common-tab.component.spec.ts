import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTabComponent } from './common-tab.component';

describe('CommonTabComponent', () => {
  let component: CommonTabComponent;
  let fixture: ComponentFixture<CommonTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommonTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
