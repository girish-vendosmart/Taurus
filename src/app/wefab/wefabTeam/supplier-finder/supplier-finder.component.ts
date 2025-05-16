import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../shared/common.service';
import * as XLSX from 'xlsx';

// Interface for supplier data
interface Supplier {
  id: number;
  name: string;
  description: string;
  specialties: string[];
  location: string;
  rating: number;
}

@Component({
  selector: 'app-supplier-finder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-finder.component.html',
  styleUrl: './supplier-finder.component.scss'
})
export class SupplierFinderComponent implements OnInit {
  // Search functionality
  searchQuery: string = '';
  hasSearched: boolean = false;
  suppliers: Supplier[] = [];
  isLoading: boolean = false;
  searchData: any[] = [];
  currentYear = new Date().getFullYear();
  showContactModal: boolean = false;
  showToast: boolean = false;
  
  popularCategories: string[] = [
    'CNC Machining',
    'Injection Molding',
    'Sheet Metal',
    '3D Printing',
    'Electronics Manufacturing',
    'Plastic Parts'
  ];

  // Mock data - in real app, this would come from a service
  mockSuppliers: Supplier[] = [
    {
      id: 1,
      name: 'Precision Manufacturing Co.',
      description: 'Specializing in CNC machining and precision parts manufacturing.',
      specialties: ['CNC Machining', 'Precision Parts', 'Metal Fabrication'],
      location: 'Detroit, MI',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Advanced Molding Solutions',
      description: 'Expert in injection molding and plastic component manufacturing.',
      specialties: ['Injection Molding', 'Plastic Parts', 'Rapid Prototyping'],
      location: 'Chicago, IL',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Sheet Metal Experts',
      description: 'Leaders in sheet metal fabrication and metal stamping.',
      specialties: ['Sheet Metal', 'Metal Stamping', 'Welding'],
      location: 'Pittsburgh, PA',
      rating: 4.7
    }
  ];

  constructor(private service: CommonService) {
    // Initialize with all suppliers
    this.suppliers = [...this.mockSuppliers];
  }

  ngOnInit(): void {
    // Initialize component
  }

  searchSuppliers() {
    this.hasSearched = true;
    // Filter suppliers based on search query
    const searchTerms = this.searchQuery.toLowerCase();

    if (!this.searchQuery.trim()) {
      this.searchData = [];
      this.suppliers = [...this.mockSuppliers];
      return;
    }

    this.getListOfSupplier(searchTerms);
  }

  getListOfSupplier(searchTerms:any) {
    this.isLoading = true;
    let endPoint = `/api/method/proq_buyer.api.supplier_onboarding.supplier_finder.gemini.get_suppliers?country=india&query=${searchTerms}&model_name=gemini-2.0-flash`;
    this.service.getCSVData(endPoint).subscribe(
      (res:any) => {
        this.searchData = this.parseCSV(res);
        // Initialize selected property for all suppliers
        this.searchData.forEach(supplier => {
          supplier.selected = false;
        });
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching supplier data:', error);
        this.isLoading = false;
      }
    );
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.suppliers = [...this.mockSuppliers];
    this.searchData = [];
    this.hasSearched = false;
  }
  
  searchByCategory(category: string) {
    this.searchQuery = category;
    this.searchSuppliers();
  }

  // Helper function for select all checkbox
  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.searchData.forEach(supplier => {
      supplier.selected = isChecked;
    });
  }
  
  // Helper function to check if any items are selected
  hasSelectedItems(): boolean {
    return this.searchData.some(supplier => supplier.selected);
  }

  // Helper function to get services as an array
  getServices(servicesString: string): string[] {
    if (!servicesString) return [];
    return servicesString.split(',').map(service => service.trim()).filter(service => service);
  }

  // Helper function to sanitize strings for IDs
  sanitizeForId(text: string | undefined): string {
    if (!text) return 'unknown';
    return text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  }

  // Helper function to get verification label
  getVerificationLabel(verificationStatus: string): string {
    if (!verificationStatus) return 'Unverified';
    
    if (verificationStatus.toLowerCase().includes('high confidence')) {
      return 'Verified';
    } else if (verificationStatus.toLowerCase().includes('medium confidence')) {
      return 'Partially Verified';
    } else if (verificationStatus.toLowerCase().includes('low confidence')) {
      return 'Limited Verification';
    }
    
    return 'Unverified';
  }

  parseCSV(csv: string) {
    const lines = csv.split('\n');
    const result: any[] = [];
    const headers = this.parseCSVLine(lines[0]);

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines

      const obj: any = {};
      const currentLine = this.parseCSVLine(lines[i]);

      for (let j = 0; j < headers.length; j++) {
        let value = currentLine[j] ? currentLine[j].trim() : '';

        // Convert to number if possible and not empty
        if (!isNaN(Number(value)) && value !== '') {
          obj[headers[j]] = Number(value);
        } else {
          obj[headers[j]] = value;
        }
      }

      result.push(obj);
    }

    return result;
  }

  // Helper to parse a single CSV line with handling for quoted values
  parseCSVLine(text: string) {
    const result: string[] = [];
    let startPos = 0;
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '"') {
        insideQuotes = !insideQuotes;
      } else if (text[i] === ',' && !insideQuotes) {
        // End of a value
        result.push(this.cleanValue(text.substring(startPos, i)));
        startPos = i + 1;
      }
    }

    // Add the last value
    result.push(this.cleanValue(text.substring(startPos)));

    return result;
  }

  // Helper to clean up values (remove quotes, etc.)
  cleanValue(value: string) {
    value = value.trim();

    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }

    // Replace double quotes with single quotes
    value = value.replace(/""/g, '"');

    return value;
  }

  getSelectedSuppliers(): any[] {
    return this.searchData.filter(supplier => supplier.selected);
  }

  exportSelected(): void {
    const selectedSuppliers = this.getSelectedSuppliers();
    
    if (selectedSuppliers.length === 0) {
      return;
    }
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create a worksheet from the selected data
    const cleanData = selectedSuppliers.map(supplier => {
      // Create a clean copy without the 'selected' property
      const cleanSupplier = { ...supplier };
      delete cleanSupplier.selected;
      return cleanSupplier;
    });
    
    const ws = XLSX.utils.json_to_sheet(cleanData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Selected Suppliers');
    
    // Generate xlsx file and trigger download
    XLSX.writeFile(wb, 'WeFab_Selected_Suppliers.xlsx');
  }

  sendInvitation(): void {
    const selectedSuppliers = this.getSelectedSuppliers();
    
    if (selectedSuppliers.length === 0) {
      return;
    }
    
    // Format data as specified
    const invitationData = {
      suppliers: selectedSuppliers.map(supplier => ({
        name: supplier['Company Name'],
        email: supplier.Email || '',
        message: `We would like to invite ${supplier['Company Name']} to collaborate on our manufacturing project.`
      }))
    };
    
    // In a real application, this would be an API call
    console.log('Sending invitation data:', invitationData);
    
    // Close modal and show success toast
    this.showContactModal = false;
    this.showToast = true;
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
