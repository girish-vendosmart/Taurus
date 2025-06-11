# Combined Supplier Onboarding Component

This component combines all three levels (L1, L2, L3) of supplier onboarding into a single, unified experience with a comprehensive stepper interface.

## Features

- **Unified 4-Step Process**: Combines all onboarding steps into a single flow
  1. Machine Capabilities (from L2)
  2. Facility Verification (from L2)
  3. Financial Information (from L3)
  4. Additional Information (from L3)

- **Progressive Navigation**: Users can navigate between steps with validation
- **Data Persistence**: Automatically loads and saves data to both L2 and L3 endpoints
- **Form Validation**: Comprehensive validation for each step
- **Responsive Design**: Mobile-friendly interface
- **File Upload Support**: Handles machine photos, facility photos, and certificates
- **Bank Verification**: Integrated bank account verification

## Integration Steps

### 1. Add to Routing Module

```typescript
// In your routing module (e.g., supplier-routing.module.ts)
{
  path: 'supplier-onboarding-combined',
  component: SupplierOnboardingCombinedComponent
}
```

### 2. Import Required Dependencies

Make sure you have all the required formly components and services:

```typescript
// Required Formly Components
- FormlyRepeatTypeComponent
- FormlyFieldFileUploadComponent
- FormlyFieldRangeSliderComponent
- FormlyFieldDropdownComponent
- FormlyFieldBankVerifyComponent

// Required Services
- CommonService
- SweetAlertService
- MessageService (PrimeNG)
```

### 3. Update Navigation Links

Replace existing L2/L3 navigation links with:

```html
<a routerLink="/wefab/supplier/supplier-onboarding-combined">Complete Onboarding</a>
```

## Component Structure

### Data Model

The component manages a comprehensive data model that includes:

```typescript
{
  // L2 Data (Manufacturing)
  machines: Array<MachineDetails>,
  certifications: Array<CertificationDetails>,
  industries: Array<string>,
  productionCapacity: number,
  facilityPhotos: Array<File>,
  
  // L3 Data (Financial)
  bankDetails: BankDetails,
  companyFinancials: FinancialInformation,
  insuranceCoverage: InsuranceDetails,
  additionalInformation: {
    references: Array<BusinessReference>
  }
}
```

### Step Configuration

Each step is configured with:
- Field definitions using Formly
- Validation rules
- Step-specific business logic
- Navigation controls

### Validation Logic

The component includes comprehensive validation:
- **Step 1**: At least one complete machine required
- **Step 2**: Minimum 3 facility photos required
- **Step 3**: Bank details and financial information required
- **Step 4**: At least one business reference required

## API Integration

### Data Loading
- Loads existing L2 data from `/api/resource/Supplier Onboarding L2/{supplierId}`
- Loads existing L3 data from `/api/resource/Supplier Onboarding L3/{supplierId}`
- Merges data for unified editing experience

### Data Saving
- Saves L2 data to `/api/resource/Supplier Onboarding L2`
- Saves L3 data to `/api/resource/Supplier Onboarding L3`
- Handles both POST (new) and PUT (update) operations
- Includes comprehensive error handling

## Usage Instructions

### For New Users
1. Navigate to the combined onboarding page
2. Complete each step in order
3. Use navigation buttons to move between steps
4. Submit to complete the entire onboarding process

### For Existing Users (Edit Mode)
1. Component automatically detects existing data
2. Pre-fills forms with saved information
3. Maintains file references and bank verification status
4. Allows step-by-step updates

## File Upload Handling

The component handles three types of file uploads:
- **Machine Photos**: Multiple photos per machine
- **Facility Photos**: Minimum 3 photos required
- **Certificate Documents**: Optional certification files

File handling includes:
- Existing file preservation during edits
- Proper file object conversion
- File validation and type checking

## Bank Verification Integration

- Integrates with BankVerifyFieldComponent
- Maintains verification status across sessions
- Updates verification status in real-time

## Navigation Features

### Step Navigation
- Click on any step in the left sidebar to jump to that step
- Progress bar shows completion percentage
- Step validation prevents skipping incomplete steps

### Mobile Responsive
- Sidebar becomes non-sticky on mobile devices
- Optimized layout for smaller screens
- Touch-friendly navigation controls

## Error Handling

- Field-level validation with custom error messages
- Step-level validation before navigation
- API error handling with user-friendly messages
- Form state preservation during errors

## Customization Options

### Adding New Steps
1. Add step info to `stepInfo` array
2. Create field configuration method
3. Add to `stepFields` array
4. Update `totalSteps` counter
5. Add step-specific validation logic

### Modifying Validation
- Update `isStepValid()` method for step-specific rules
- Modify field configurations for field-level validation
- Add custom validators as needed

### Styling Customization
- Modify SCSS file for visual customization
- Update step colors and animations
- Customize form field styling

## Testing

### Validation Testing
- Test each step's validation rules
- Verify navigation restrictions
- Test error message display

### Data Persistence Testing
- Test with new supplier accounts
- Test with existing data loading
- Verify file upload preservation
- Test API error scenarios

### Cross-Browser Testing
- Test responsive design on mobile devices
- Verify file upload functionality
- Test form validation behavior

## Performance Considerations

- Lazy loading of file data
- Optimized form rendering
- Efficient data merging strategies
- Minimal API calls during navigation

## Future Enhancements

Potential improvements:
- Auto-save functionality
- Draft mode for incomplete forms
- Enhanced file preview capabilities
- Bulk data import options
- Advanced validation rules
- Multi-language support

## Dependencies

This component requires:
- Angular 15+
- PrimeNG UI components
- Formly forms
- Custom formly components
- File upload utilities
- Sweet Alert service
- Common service for API calls

## Support

For issues or questions regarding this component:
1. Check the browser console for detailed error messages
2. Verify all dependencies are properly imported
3. Ensure API endpoints are accessible
4. Review form validation requirements 