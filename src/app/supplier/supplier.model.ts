export interface Supplier {
    // Basic Information
    companyName: string;
    tradingName?: string;
    taxId: string;
    registrationNumber: string;
    
    // Contact Information
    primaryContact: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      position: string;
    };
    
    // Address Information
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    
    // Banking Details
    bankInformation: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      branchCode: string;
      routingNumber?: string;
      iban?: string;
      swift?: string;
    };
    
    // Business Details
    businessType: string;
    yearEstablished: number;
    numberOfEmployees: string;
    annualRevenue?: string;
    
    // Product/Service Information
    productCategories: string[];
    serviceDescription: string;
    certifications: string[];
    
    // Terms and Compliance
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
    
    // Additional Information
    additionalNotes?: string;
  }