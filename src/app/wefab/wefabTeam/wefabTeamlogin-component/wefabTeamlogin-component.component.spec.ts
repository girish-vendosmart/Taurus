import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WefabTeamloginComponentComponent } from './wefabTeamlogin-component.component';

describe('WefabTeamloginComponentComponent', () => {
  let component: WefabTeamloginComponentComponent;
  let fixture: ComponentFixture<WefabTeamloginComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WefabTeamloginComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WefabTeamloginComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
