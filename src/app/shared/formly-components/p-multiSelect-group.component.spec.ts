import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { PMultiSelectGroupComponent } from '../../shared/formly-components/p-multiSelect-group.component';
import { FormlyModule } from '@ngx-formly/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PMultiSelectGroupComponent', () => {
  let component: PMultiSelectGroupComponent;
  let fixture: ComponentFixture<PMultiSelectGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PMultiSelectGroupComponent,
        ReactiveFormsModule,
        FormsModule,
        FormlyModule.forRoot(),
        MultiSelectModule,
        InputTextModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PMultiSelectGroupComponent);
    component = fixture.componentInstance;
    
    // Set up basic field configuration
    const mockField = {
      key: 'test',
      templateOptions: {
        groups: [
          {
            label: 'Precision Machining',
            items: [
              { value: '3axis', label: '3-axis Milling' },
              { value: '4axis', label: '4-axis Milling' },
              { value: 'turning', label: 'Turning/Lathe' }
            ]
          },
          {
            label: '3D Printing',
            items: [
              { value: 'fdm', label: 'FDM' },
              { value: 'sla', label: 'SLA' },
              { value: 'sls', label: 'SLS' }
            ]
          }
        ]
      }
    } as any;
    
    // Use Object.defineProperty to set readonly properties
    Object.defineProperty(component, 'field', {
      value: mockField,
      writable: true
    });
    
    Object.defineProperty(component, 'formControl', {
      value: new FormControl(),
      writable: true
    });
    
    Object.defineProperty(component, 'to', {
      value: mockField.templateOptions || {},
      writable: true
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process groups correctly', () => {
    component.processOptions();
    expect(component.groupedOptions.length).toBe(2);
    expect(component.groupedOptions[0].label).toBe('Precision Machining');
    expect(component.groupedOptions[1].label).toBe('3D Printing');
  });

  it('should filter by group name - Precision Machining', () => {
    component.processOptions();
    
    // Test filtering by group name "Precision Machining"
    component.performCustomFilter('Precision Machining');
    
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('Precision Machining');
    expect(component.filteredGroupedOptions[0].items.length).toBe(3); // All items in the group
  });

  it('should filter by group name - 3D Printing', () => {
    component.processOptions();
    
    // Test filtering by group name "3D Printing"
    component.performCustomFilter('3D Printing');
    
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('3D Printing');
    expect(component.filteredGroupedOptions[0].items.length).toBe(3); // All items in the group
  });

  it('should filter by partial group name - "Precision"', () => {
    component.processOptions();
    
    // Test filtering by partial group name
    component.performCustomFilter('Precision');
    
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('Precision Machining');
  });

  it('should filter by item name - "FDM"', () => {
    component.processOptions();
    
    // Test filtering by item name
    component.performCustomFilter('FDM');
    
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('3D Printing');
    expect(component.filteredGroupedOptions[0].items.length).toBe(1);
    expect(component.filteredGroupedOptions[0].items[0].label).toBe('FDM');
  });

  it('should filter by partial item name - "axis"', () => {
    component.processOptions();
    
    // Test filtering by partial item name
    component.performCustomFilter('axis');
    
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('Precision Machining');
    expect(component.filteredGroupedOptions[0].items.length).toBe(2); // 3-axis and 4-axis
  });

  it('should return all groups when filter is empty', () => {
    component.processOptions();
    
    // Test with empty filter
    component.performCustomFilter('');
    
    expect(component.filteredGroupedOptions.length).toBe(2);
  });

  it('should return no groups when filter matches nothing', () => {
    component.processOptions();
    
    // Test with filter that matches nothing
    component.performCustomFilter('NonExistentTerm');
    
    expect(component.filteredGroupedOptions.length).toBe(0);
  });

  it('should be case insensitive', () => {
    component.processOptions();
    
    // Test case insensitive filtering
    component.performCustomFilter('precision machining');
    
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('Precision Machining');
  });

  it('should handle search input change', () => {
    component.processOptions();
    
    // Mock event object
    const mockEvent = {
      target: {
        value: 'Precision Machining'
      }
    };
    
    // Test onSearchChange method
    component.onSearchChange(mockEvent);
    
    expect(component.searchValue).toBe('Precision Machining');
    expect(component.filteredGroupedOptions.length).toBe(1);
    expect(component.filteredGroupedOptions[0].label).toBe('Precision Machining');
  });
}); 