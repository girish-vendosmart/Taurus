import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GooglePlacesComponentComponent } from './google-places-component.component';

describe('GooglePlacesComponentComponent', () => {
  let component: GooglePlacesComponentComponent;
  let fixture: ComponentFixture<GooglePlacesComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GooglePlacesComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GooglePlacesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
