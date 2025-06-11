# Testing Guide for Combined Supplier Onboarding Component

This guide provides step-by-step instructions to test the combined supplier onboarding component thoroughly.

## Prerequisites

Before testing, ensure you have:
- ✅ Component files are in place
- ✅ All dependencies are imported
- ✅ Routing is configured
- ✅ API endpoints are accessible
- ✅ Sample supplier ID in localStorage

## Setup Instructions

### 1. Add Component to Your Module

First, ensure the component is properly imported in your module:

```typescript
// In your supplier.module.ts or app.module.ts
import { SupplierOnboardingCombinedComponent } from './onboarding/supplier-onboarding-combined/supplier-onboarding-combined.component';

@NgModule({
  imports: [
    // ... other imports
    SupplierOnboardingCombinedComponent  // Add this
  ],
  // ...
})
```

### 2. Update Routing

Add the route to your routing module:

```typescript
// In supplier-routing.module.ts
const routes: Routes = [
  // ... existing routes
  {
    path: 'supplier-onboarding-combined',
    component: SupplierOnboardingCombinedComponent
  }
];
```

### 3. Set Test Data

Before testing, set a supplier ID in localStorage:

```javascript
// In browser console or component
localStorage.setItem('supplier_id', 'your-test-supplier-id');
```

## Testing Checklist

### ✅ Component Loading Test

1. **Navigate to Component**
   ```
   URL: http://localhost:4200/wefab/supplier/supplier-onboarding-combined
   ```

2. **Check Console**
   - Open browser DevTools (F12)
   - Look for any error messages
   - Should see: "L2 data not found, starting fresh" or actual data loading

3. **Visual Verification**
   - [ ] Header shows "Supplier Complete Onboarding"
   - [ ] 4 steps visible in left sidebar
   - [ ] Progress bar shows "Step 1 of 4"
   - [ ] Form fields are rendered properly

### ✅ Step 1: Machine Capabilities Test

1. **Navigation**
   - [ ] Step 1 is active by default
   - [ ] Title shows "Machine Capabilities"
   - [ ] Description is visible

2. **Machine Details Form**
   - [ ] Add machine button works
   - [ ] Required fields show validation errors when empty
   - [ ] Can fill in: Make, Model, Specifications, Quantity
   - [ ] File upload field appears for machine photos

3. **File Upload Test**
   ```javascript
   // Test file upload by selecting image files
   // Check console for file processing logs
   ```

4. **Certifications Section**
   - [ ] Can add certifications (optional)
   - [ ] Date picker works for expiration date
   - [ ] Certificate document upload works

5. **Production & Industries**
   - [ ] Production capacity slider works (0-100%)
   - [ ] Industries multi-select works
   - [ ] Can select multiple industries

6. **Step Validation**
   - [ ] "Continue" button validates required fields
   - [ ] Error shown if machine details incomplete
   - [ ] Can proceed when at least one complete machine is added

### ✅ Step 2: Facility Verification Test

1. **Navigation**
   - [ ] Can navigate from Step 1 after validation
   - [ ] Step 2 becomes active
   - [ ] Progress bar updates to "Step 2 of 4"

2. **Facility Photos**
   - [ ] Multiple file upload works
   - [ ] Validation requires at least 3 photos
   - [ ] File type validation (PNG, JPEG only)
   - [ ] File size validation

3. **Step Validation**
   ```javascript
   // Test with less than 3 photos - should show error
   // Test with 3+ photos - should allow continuation
   ```

### ✅ Step 3: Financial Information Test

1. **Navigation**
   - [ ] Can navigate from Step 2
   - [ ] Step 3 becomes active
   - [ ] Progress bar shows "Step 3 of 4"

2. **Bank Details**
   - [ ] All bank fields are required
   - [ ] Account type dropdown works
   - [ ] Form validation prevents empty submission

3. **Bank Verification**
   - [ ] Bank verification component loads
   - [ ] Account number and IFSC fields work
   - [ ] Verification status updates

4. **Financial Overview**
   - [ ] Revenue fields format numbers correctly
   - [ ] Indian currency formatting (commas)
   - [ ] Tax compliance checkbox works

5. **Insurance Coverage**
   - [ ] Insurance amount fields work
   - [ ] Number formatting applies
   - [ ] Fields are optional

### ✅ Step 4: Additional Information Test

1. **Navigation**
   - [ ] Can navigate from Step 3
   - [ ] Step 4 becomes active
   - [ ] Progress bar shows "Step 4 of 4"

2. **Business References**
   - [ ] At least one reference required
   - [ ] Can add multiple references
   - [ ] Email validation works
   - [ ] All reference fields are required

3. **Final Submit**
   - [ ] Submit button appears ("Complete Onboarding")
   - [ ] Validates all steps before submission
   - [ ] Shows success message on completion
   - [ ] Redirects to completion page

## Data Persistence Testing

### Test Existing Data Loading

1. **Create Test Data**
   ```javascript
   // Manually create L2 and L3 records via API
   // Or use existing supplier data
   ```

2. **Reload Component**
   - [ ] Refresh page
   - [ ] Check if existing data loads
   - [ ] Verify file uploads are preserved
   - [ ] Confirm currency formatting is applied

3. **Edit Mode Testing**
   - [ ] Modify data in each step
   - [ ] Save changes
   - [ ] Reload to verify persistence

### API Integration Testing

1. **Monitor Network Tab**
   ```
   DevTools > Network Tab
   ```
   - [ ] Check L2 data loading call
   - [ ] Check L3 data loading call
   - [ ] Monitor save operations (POST/PUT)

2. **Error Handling**
   ```javascript
   // Test with invalid supplier ID
   localStorage.setItem('supplier_id', 'invalid-id');
   ```
   - [ ] Graceful error handling
   - [ ] User-friendly error messages

## Validation Testing

### Required Field Validation

1. **Step 1 Validation**
   ```javascript
   // Try to proceed without filling machine details
   // Should show validation errors
   ```

2. **Step 2 Validation**
   ```javascript
   // Try to proceed without 3+ facility photos
   // Should prevent navigation
   ```

3. **Step 3 Validation**
   ```javascript
   // Try to proceed without bank details
   // Should show required field errors
   ```

4. **Step 4 Validation**
   ```javascript
   // Try to submit without business references
   // Should prevent submission
   ```

### Cross-Step Validation

```javascript
// Test submitting with incomplete earlier steps
// Component should validate all steps before final submission
```

## File Upload Testing

### Upload Different File Types

1. **Valid Files**
   - [ ] PNG images
   - [ ] JPEG images
   - [ ] Multiple files at once

2. **Invalid Files**
   - [ ] PDF files (should be rejected)
   - [ ] Large files (should show error)
   - [ ] Non-image files

3. **File Preservation**
   - [ ] Upload files and navigate between steps
   - [ ] Files should remain attached
   - [ ] Reload page - files should persist if saved

## Responsive Design Testing

### Mobile Testing

1. **Device Simulation**
   ```
   DevTools > Toggle Device Toolbar
   Test on: iPhone, iPad, Android phones
   ```

2. **Layout Verification**
   - [ ] Sidebar becomes non-sticky on mobile
   - [ ] Forms are touch-friendly
   - [ ] Buttons are appropriately sized
   - [ ] Text is readable

3. **Navigation Testing**
   - [ ] Step navigation works on mobile
   - [ ] Form scrolling works properly
   - [ ] File upload works on touch devices

## Performance Testing

### Load Time Testing

```javascript
// Monitor performance in DevTools
console.time('component-load');
// Navigate to component
console.timeEnd('component-load');
```

### Memory Usage

1. **Check for Memory Leaks**
   - [ ] Navigate between steps multiple times
   - [ ] Upload and remove files
   - [ ] Monitor memory usage in DevTools

## Browser Compatibility Testing

Test on multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (latest)

## Debug Mode Testing

### Enable Debug Logging

Add to component constructor:
```typescript
constructor() {
  // Add debug logging
  console.log('Component initialized');
}
```

### Console Commands for Testing

```javascript
// Check current form state
JSON.stringify($0.__ngContext__[0].form.value, null, 2)

// Check validation state
$0.__ngContext__[0].form.valid

// Check current step
$0.__ngContext__[0].activeStepIndex

// Check model data
JSON.stringify($0.__ngContext__[0].model, null, 2)
```

## Common Issues & Solutions

### 1. Component Not Loading
```bash
# Check if all dependencies are imported
ng serve --verbose
```

### 2. File Upload Not Working
```javascript
// Check file upload component is imported
// Verify acceptedTypes configuration
```

### 3. API Calls Failing
```javascript
// Check network tab for error details
// Verify supplier_id in localStorage
// Check API endpoint URLs
```

### 4. Validation Not Working
```javascript
// Check form control names match field keys
// Verify Formly field configurations
```

### 5. Step Navigation Issues
```javascript
// Check activeStepIndex updates
// Verify step validation logic
```

## Automated Testing Setup

### Unit Tests Template

```typescript
// supplier-onboarding-combined.component.spec.ts
describe('SupplierOnboardingCombinedComponent', () => {
  beforeEach(() => {
    // Setup test module
  });

  it('should create', () => {
    // Test component creation
  });

  it('should load existing data', () => {
    // Test data loading
  });

  it('should validate steps properly', () => {
    // Test step validation
  });

  it('should save data correctly', () => {
    // Test data saving
  });
});
```

### E2E Testing

```typescript
// e2e test for complete flow
describe('Supplier Onboarding Flow', () => {
  it('should complete entire onboarding process', () => {
    // Test full user journey
  });
});
```

## Test Data Templates

### Machine Data
```json
{
  "make": "Haas",
  "model": "VF-2",
  "specifications": "Travel: 30\"x16\"x20\"",
  "quantity": 2,
  "machinePhotos": [/* file objects */]
}
```

### Financial Data
```json
{
  "bankDetails": {
    "bankName": "State Bank of India",
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Test Company Ltd",
    "accountType": "Current",
    "branchName": "Main Branch"
  },
  "companyFinancials": {
    "annualRevenue2024": "1,00,00,000",
    "annualRevenue2023": "90,00,000",
    "annualRevenue2022": "80,00,000",
    "taxCompliant": true
  }
}
```

## Success Criteria

The component passes testing if:
- ✅ All steps load without errors
- ✅ Form validation works correctly
- ✅ File uploads function properly
- ✅ Data persists across sessions
- ✅ API integration works
- ✅ Responsive design functions
- ✅ Complete flow can be submitted successfully
- ✅ Error handling is graceful
- ✅ Performance is acceptable

## Post-Testing Checklist

After successful testing:
- [ ] Document any issues found
- [ ] Update component if necessary
- [ ] Deploy to staging environment
- [ ] Conduct user acceptance testing
- [ ] Plan production deployment 