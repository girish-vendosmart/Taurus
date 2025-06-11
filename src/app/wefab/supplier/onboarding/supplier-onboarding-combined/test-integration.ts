/**
 * Quick Integration Test Script for Combined Supplier Onboarding Component
 * 
 * Run this script in browser console to quickly verify component functionality
 * Navigate to the component page first, then run: testComponent()
 */

// Global test function
(window as any).testComponent = function() {
  console.log('🚀 Starting Combined Supplier Onboarding Component Test...');
  
  // Test 1: Check if component is loaded
  const componentElement = document.querySelector('app-supplier-onboarding-combined');
  if (!componentElement) {
    console.error('❌ Component not found in DOM');
    return false;
  }
  console.log('✅ Component found in DOM');

  // Test 2: Check if Angular context exists
  const ngContext = (componentElement as any).__ngContext__;
  if (!ngContext || !ngContext[0]) {
    console.error('❌ Angular context not found');
    return false;
  }
  const component = ngContext[0];
  console.log('✅ Angular context accessible');

  // Test 3: Check component properties
  const requiredProperties = ['form', 'model', 'stepFields', 'activeStepIndex', 'totalSteps'];
  const missingProperties = requiredProperties.filter(prop => !(prop in component));
  if (missingProperties.length > 0) {
    console.error(`❌ Missing properties: ${missingProperties.join(', ')}`);
    return false;
  }
  console.log('✅ All required properties present');

  // Test 4: Check form initialization
  if (!component.form || typeof component.form.get !== 'function') {
    console.error('❌ Form not properly initialized');
    return false;
  }
  console.log('✅ Form properly initialized');

  // Test 5: Check step configuration
  if (!Array.isArray(component.stepFields) || component.stepFields.length !== 4) {
    console.error(`❌ Step fields not properly configured. Expected 4 steps, got ${component.stepFields?.length}`);
    return false;
  }
  console.log('✅ Step fields properly configured');

  // Test 6: Check model structure
  const requiredModelProperties = ['machines', 'bankDetails', 'companyFinancials', 'additionalInformation'];
  const missingModelProps = requiredModelProperties.filter(prop => !(prop in component.model));
  if (missingModelProps.length > 0) {
    console.error(`❌ Missing model properties: ${missingModelProps.join(', ')}`);
    return false;
  }
  console.log('✅ Model structure is correct');

  // Test 7: Check if steps are navigable
  try {
    const originalStep = component.activeStepIndex;
    component.goToStep(1);
    if (component.activeStepIndex !== 1) {
      console.error('❌ Step navigation not working');
      return false;
    }
    component.goToStep(originalStep); // Reset
    console.log('✅ Step navigation working');
  } catch (error) {
    console.error('❌ Error during step navigation:', error);
    return false;
  }

  // Test 8: Check current fields
  const currentFields = component.currentFields;
  if (!Array.isArray(currentFields) || currentFields.length === 0) {
    console.error('❌ Current fields not properly loaded');
    return false;
  }
  console.log('✅ Current fields loaded');

  // Test 9: Check step info
  if (!Array.isArray(component.stepInfo) || component.stepInfo.length !== 4) {
    console.error('❌ Step info not properly configured');
    return false;
  }
  console.log('✅ Step info configured');

  console.log('🎉 All basic tests passed! Component appears to be working correctly.');
  
  // Return component reference for further manual testing
  return component;
};

// Form testing function
(window as any).testFormValidation = function() {
  console.log('🔍 Testing form validation...');
  
  const componentElement = document.querySelector('app-supplier-onboarding-combined');
  if (!componentElement) {
    console.error('❌ Component not found');
    return;
  }
  
  const component = (componentElement as any).__ngContext__[0];
  
  // Test step validation
  for (let i = 0; i < component.totalSteps; i++) {
    component.activeStepIndex = i;
    const isValid = component.isStepValid(component.currentFields);
    console.log(`Step ${i + 1} validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  // Test overall form validation
  const isFormValid = component.form.valid;
  console.log(`Overall form validation: ${isFormValid ? '✅ Valid' : '❌ Invalid'}`);
  
  // Test all steps validation
  const allStepsValid = component.isAllStepsValid();
  console.log(`All steps validation: ${allStepsValid ? '✅ Valid' : '❌ Invalid'}`);
};

// Data testing function
(window as any).testDataStructure = function() {
  console.log('📊 Testing data structure...');
  
  const componentElement = document.querySelector('app-supplier-onboarding-combined');
  if (!componentElement) {
    console.error('❌ Component not found');
    return;
  }
  
  const component = (componentElement as any).__ngContext__[0];
  
  console.log('Current model data:');
  console.log(JSON.stringify(component.model, null, 2));
  
  console.log('Current form value:');
  console.log(JSON.stringify(component.form.value, null, 2));
  
  return {
    model: component.model,
    formValue: component.form.value,
    formValid: component.form.valid
  };
};

// API testing function
(window as any).testAPIIntegration = function() {
  console.log('🌐 Testing API integration...');
  
  const supplierId = localStorage.getItem('supplier_id');
  if (!supplierId) {
    console.error('❌ No supplier_id found in localStorage');
    console.log('Set supplier ID with: localStorage.setItem("supplier_id", "your-supplier-id")');
    return;
  }
  
  console.log(`✅ Supplier ID found: ${supplierId}`);
  
  const componentElement = document.querySelector('app-supplier-onboarding-combined');
  if (!componentElement) {
    console.error('❌ Component not found');
    return;
  }
  
  const component = (componentElement as any).__ngContext__[0];
  
  // Test if component has API methods
  const apiMethods = ['loadExistingData', 'saveAllData', 'prepareFormData'];
  const missingMethods = apiMethods.filter(method => typeof component[method] !== 'function');
  
  if (missingMethods.length > 0) {
    console.error(`❌ Missing API methods: ${missingMethods.join(', ')}`);
    return false;
  }
  
  console.log('✅ All API methods present');
  
  // Test data preparation
  try {
    const formData = component.prepareFormData();
    console.log('✅ Data preparation successful');
    console.log('Prepared data structure:', Object.keys(formData));
    return formData;
  } catch (error) {
    console.error('❌ Error preparing form data:', error);
    return false;
  }
};

// File upload testing function
(window as any).testFileUpload = function() {
  console.log('📁 Testing file upload functionality...');
  
  const componentElement = document.querySelector('app-supplier-onboarding-combined');
  if (!componentElement) {
    console.error('❌ Component not found');
    return;
  }
  
  const component = (componentElement as any).__ngContext__[0];
  
  // Check file conversion methods
  const fileMethods = ['convertFilesToObjects', 'convertSingleFileToObject', 'getFileNameFromUrl', 'getFileTypeFromUrl'];
  const missingMethods = fileMethods.filter(method => typeof component[method] !== 'function');
  
  if (missingMethods.length > 0) {
    console.error(`❌ Missing file methods: ${missingMethods.join(', ')}`);
    return false;
  }
  
  console.log('✅ All file handling methods present');
  
  // Test file conversion with sample data
  try {
    const testFileData = 'https://example.com/test-image.jpg';
    const convertedFile = component.convertSingleFileToObject(testFileData);
    console.log('✅ File conversion test successful');
    console.log('Sample converted file:', convertedFile);
    return true;
  } catch (error) {
    console.error('❌ Error in file conversion:', error);
    return false;
  }
};

// Complete test suite
(window as any).runAllTests = function() {
  console.log('🧪 Running complete test suite...');
  
  const tests = [
    { name: 'Component Basic Test', fn: (window as any).testComponent },
    { name: 'Form Validation Test', fn: (window as any).testFormValidation },
    { name: 'API Integration Test', fn: (window as any).testAPIIntegration },
    { name: 'File Upload Test', fn: (window as any).testFileUpload }
  ];
  
  const results = tests.map(test => {
    console.log(`\n--- ${test.name} ---`);
    try {
      const result = test.fn();
      return { name: test.name, passed: !!result, result };
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error);
      return { name: test.name, passed: false, error };
    }
  });
  
  console.log('\n📋 Test Results Summary:');
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  console.log(`\n🏆 ${passedCount}/${results.length} tests passed`);
  
  if (passedCount === results.length) {
    console.log('🎉 All tests passed! Component is ready for use.');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.');
  }
  
  return results;
};

console.log('🔧 Test functions loaded! Available commands:');
console.log('- testComponent() - Basic component test');
console.log('- testFormValidation() - Form validation test');
console.log('- testDataStructure() - Data structure test');
console.log('- testAPIIntegration() - API integration test'); 
console.log('- testFileUpload() - File upload test');
console.log('- runAllTests() - Run complete test suite');
console.log('\nNavigate to the component page and run any of these functions to test!');

export {}; // Make this a module 