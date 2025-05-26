import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedTableComponent } from './enhanced-table.component';

describe('EnhancedTableComponent', () => {
  let component: EnhancedTableComponent;
  let fixture: ComponentFixture<EnhancedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnhancedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 