# Quick Start Guide - Combined Supplier Onboarding Component

## ⚡ 5-Minute Setup & Test

### Step 1: Add Component to Your Application

**Option A: Standalone Component (Recommended)**
```typescript
// In your routing module (e.g., app-routing.module.ts or supplier-routing.module.ts)
import { SupplierOnboardingCombinedComponent } from './wefab/supplier/onboarding/supplier-onboarding-combined/supplier-onboarding-combined.component';

const routes: Routes = [
  // ... your existing routes
  {
    path: 'supplier-onboarding-combined',
    component: SupplierOnboardingCombinedComponent
  }
];
```

**Option B: Module-based**
```typescript
// In your module file
import { SupplierOnboardingCombinedComponent } from './onboarding/supplier-onboarding-combined/supplier-onboarding-combined.component';

@NgModule({
  imports: [
    SupplierOnboardingCombinedComponent  // Add here for standalone
  ],
  // OR for non-standalone:
  declarations: [
    SupplierOnboardingCombinedComponent
  ]
})
```

### Step 2: Set Required Data

**Set supplier ID in localStorage:**
```javascript
// In browser console or your component
localStorage.setItem('supplier_id', 'test-supplier-123');
```

### Step 3: Navigate & Test

1. **Start your development server:**
   ```bash
   ng serve
   ```

2. **Navigate to the component:**
   ```
   http://localhost:4200/supplier-onboarding-combined
   ```

3. **Open browser DevTools (F12) and run quick test:**
   ```javascript
   runAllTests()
   ```

## 🔧 Essential Dependencies Check

Make sure these are imported in your application:

```typescript
// Required for forms
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

// Required PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';

// Required custom components (should be in your shared folder)
import { FormlyRepeatTypeComponent } from '../../../../shared/formly-components/formly-repeat-type.component';
import { FormlyFieldFileUploadComponent } from '../../../../shared/formly-components/file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from '../../../../shared/formly-components/range-slider-type.component';
import { FormlyFieldDropdownComponent } from '../../../../shared/formly-components/dropdown-type.component';
import { FormlyFieldBankVerifyComponent } from '../../../../shared/formly-components/bank-verify-type.component';
```

## 🎯 Quick Visual Test

When the component loads correctly, you should see:

1. **Header Section:**
   - "Supplier Complete Onboarding" title
   - "All Steps Combined" badge
   - Descriptive text

2. **Left Sidebar:**
   - 4 steps listed:
     1. Machine Capabilities
     2. Facility Verification  
     3. Financial Information
     4. Additional Information
   - Step 1 should be active (highlighted)

3. **Right Form Area:**
   - Progress bar showing "Step 1 of 4"
   - "Machine Capabilities" title
   - Form fields for machine details
   - "Back" and "Continue" buttons

## 🚨 Common Issues & Quick Fixes

### Issue 1: Component not loading
```bash
# Check for compilation errors
ng serve --verbose
```

**Solution:**
- Verify all imports are correct
- Check file paths in imports
- Ensure component is properly exported

### Issue 2: Form fields not appearing
**Check console for errors:**
```javascript
// In browser console
console.log('Formly errors:', document.querySelectorAll('.ng-invalid'));
```

**Solution:**
- Verify Formly modules are imported
- Check if custom Formly components exist
- Ensure FormlyBootstrapModule is imported

### Issue 3: "supplier_id not found" error
```javascript
// Set supplier ID
localStorage.setItem('supplier_id', 'test-supplier-123');
// Refresh page
location.reload();
```

### Issue 4: API calls failing
**Check network tab in DevTools:**
- Look for 404 or 500 errors
- Verify API endpoints are correct
- Check if backend is running

**Quick fix for testing:**
```typescript
// Temporarily comment out API calls in ngOnInit
// ngOnInit(): void {
//   this.checkScreenSize();
//   this.stepFields = [...];
//   // Comment out: this.loadExistingData(supplierId);
// }
```

## 🧪 Quick Test Commands

**Run these in browser console after navigating to the component:**

```javascript
// Basic functionality test
testComponent()

// Check if form is working
testFormValidation()

// Check data structure
testDataStructure()

// Test all functionality
runAllTests()

// Manual inspection
JSON.stringify($0.__ngContext__[0].model, null, 2)
```

## 📱 Mobile Test

1. **Open DevTools (F12)**
2. **Click device toggle button** (or Ctrl+Shift+M)
3. **Select mobile device** (iPhone, Android)
4. **Verify:**
   - Sidebar layout changes
   - Forms are touch-friendly
   - Navigation works on mobile

## ✅ Success Checklist

Your component is working correctly if:

- [ ] Component loads without console errors
- [ ] All 4 steps are visible in sidebar
- [ ] Form fields render properly
- [ ] Step navigation works (clicking sidebar steps)
- [ ] Progress bar updates correctly
- [ ] Form validation shows errors appropriately
- [ ] File upload fields appear
- [ ] Mobile layout works properly

## 🎉 Next Steps

Once basic testing passes:

1. **Fill out each step with test data**
2. **Test file uploads with real images**
3. **Test complete form submission**
4. **Test with existing data (if API is connected)**
5. **Test responsive design on different devices**

## 💡 Pro Tips

1. **Use browser console for debugging:**
   ```javascript
   // Access component directly
   const comp = document.querySelector('app-supplier-onboarding-combined').__ngContext__[0];
   
   // Check current step
   console.log('Current step:', comp.activeStepIndex);
   
   // Check form value
   console.log('Form value:', comp.form.value);
   
   // Check validation
   console.log('Form valid:', comp.form.valid);
   ```

2. **Test validation by intentionally leaving fields empty**

3. **Use the test script for automated validation**

4. **Check network tab for API calls**

5. **Test both new user flow and edit mode (with existing data)**

## 🆘 Need Help?

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify all dependencies** are installed and imported
3. **Run the test script** to identify specific problems
4. **Check the TESTING_GUIDE.md** for detailed troubleshooting
5. **Ensure your API endpoints** match the component's expectations

The component should work out of the box once dependencies are properly set up. The test scripts will help you identify any configuration issues quickly! 