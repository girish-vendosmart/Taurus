import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PDropdownGroupSearchComponent, DropdownGroup } from './p-dropdown-group-search.component';
import { DropdownModule } from 'primeng/dropdown';

describe('PDropdownGroupSearchComponent', () => {
  let component: PDropdownGroupSearchComponent;
  let fixture: ComponentFixture<PDropdownGroupSearchComponent>;

  const mockOptions: DropdownGroup[] = [
    {
      label: 'Frontend',
      items: [
        { label: 'Angular', value: 'angular' },
        { label: 'React', value: 'react' },
        { label: 'Vue.js', value: 'vue' }
      ]
    },
    {
      label: 'Backend',
      items: [
        { label: 'Node.js', value: 'nodejs' },
        { label: 'Python', value: 'python' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PDropdownGroupSearchComponent,
        ReactiveFormsModule,
        DropdownModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PDropdownGroupSearchComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided options', () => {
    expect(component.originalOptions).toEqual(mockOptions);
    expect(component.filteredOptions).toEqual(mockOptions);
  });

  it('should filter options by group name', () => {
    component.onFilterChange({ filter: 'frontend' });
    
    expect(component.filteredOptions.length).toBe(1);
    expect(component.filteredOptions[0].label).toBe('Frontend');
    expect(component.filteredOptions[0].items.length).toBe(3);
  });

  it('should filter options by item name', () => {
    component.onFilterChange({ filter: 'angular' });
    
    expect(component.filteredOptions.length).toBe(1);
    expect(component.filteredOptions[0].label).toBe('Frontend');
    expect(component.filteredOptions[0].items.length).toBe(1);
    expect(component.filteredOptions[0].items[0].label).toBe('Angular');
  });

  it('should clear filter when empty string is provided', () => {
    component.onFilterChange({ filter: 'angular' });
    component.onFilterChange({ filter: '' });
    
    expect(component.filteredOptions).toEqual(mockOptions);
  });

  it('should highlight search terms', () => {
    const highlighted = component.highlightSearchTerm('Angular Framework', 'angular');
    expect(highlighted).toContain('<span class="highlight">Angular</span>');
  });

  it('should escape regex characters in search terms', () => {
    const result = component['escapeRegExp']('test.string');
    expect(result).toBe('test\\.string');
  });

  it('should emit selection change events', () => {
    spyOn(component.selectionChange, 'emit');
    
    component.dropdownControl.setValue('angular');
    
    expect(component.selectionChange.emit).toHaveBeenCalledWith('angular');
  });

  it('should clear selection', () => {
    component.dropdownControl.setValue('angular');
    component.clearSelection();
    
    expect(component.dropdownControl.value).toBeNull();
  });

  it('should select option programmatically', () => {
    component.selectOption('react');
    
    expect(component.dropdownControl.value).toBe('react');
  });

  it('should get selected option', () => {
    component.dropdownControl.setValue('vue');
    
    expect(component.getSelectedOption()).toBe('vue');
  });

  it('should refresh options', () => {
    const newOptions: DropdownGroup[] = [
      {
        label: 'Database',
        items: [
          { label: 'PostgreSQL', value: 'postgres' },
          { label: 'MongoDB', value: 'mongo' }
        ]
      }
    ];

    component.refreshOptions(newOptions);
    
    expect(component.options).toEqual(newOptions);
    expect(component.originalOptions).toEqual(newOptions);
    expect(component.filteredOptions).toEqual(newOptions);
  });

  it('should count total items correctly', () => {
    const totalItems = component.getTotalItemsCount();
    expect(totalItems).toBe(5); // 3 frontend + 2 backend
  });

  it('should get visible items count for a group', () => {
    const frontendGroup = mockOptions[0];
    const count = component.getVisibleItemsCount(frontendGroup);
    expect(count).toBe(3);
  });

  it('should handle ControlValueAccessor methods', () => {
    const onChangeSpy = jasmine.createSpy('onChange');
    const onTouchedSpy = jasmine.createSpy('onTouched');

    component.registerOnChange(onChangeSpy);
    component.registerOnTouched(onTouchedSpy);

    component.writeValue('test-value');
    expect(component.selectedValue).toBe('test-value');
    expect(component.dropdownControl.value).toBe('test-value');

    component.dropdownControl.setValue('new-value');
    expect(onChangeSpy).toHaveBeenCalledWith('new-value');

    component.onSelectionChange({});
    expect(onTouchedSpy).toHaveBeenCalled();
  });

  it('should handle disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
    expect(component.dropdownControl.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
    expect(component.dropdownControl.enabled).toBe(true);
  });

  it('should reset filter when dropdown opens', () => {
    component.currentFilter = 'test';
    component.filteredOptions = [];
    
    component.onDropdownShow();
    
    expect(component.currentFilter).toBe('');
    expect(component.filteredOptions).toEqual(mockOptions);
  });

  it('should get display label correctly', () => {
    const stringOption = 'test';
    const objectOption = { label: 'Test Label', value: 'test' };

    expect(component.getDisplayLabel(stringOption)).toBe('test');
    expect(component.getDisplayLabel(objectOption)).toBe('Test Label');
    expect(component.getDisplayLabel(null)).toBe('');
  });
}); 