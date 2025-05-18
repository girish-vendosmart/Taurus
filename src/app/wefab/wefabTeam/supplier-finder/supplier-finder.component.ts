import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../shared/common.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Interface for supplier data
interface Supplier {
  id: number;
  name: string;
  description: string;
  specialties: string[];
  location: string;
  rating: number;
}

interface SelectedSupplier {
  supplier_email_id: string;
  supplier_name: string;
  company_name: string;
  phone_number: string;
}

@Component({
  selector: 'app-supplier-finder',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './supplier-finder.component.html',
  styleUrl: './supplier-finder.component.scss'
})
export class SupplierFinderComponent {
  // Search functionality
  searchQuery: string = '';
  hasSearched: boolean = false;
  suppliers: Supplier[] = [];
  isLoading: boolean = false;
  selectedSuppliers: Set<string> = new Set();
  showInvitationDialog: boolean = false;
  selectedSuppliersList: SelectedSupplier[] = [];

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
  searchData: any[] = [];

  constructor(private service: CommonService, private messageService: MessageService, private confirmationService: ConfirmationService) {
    // Initialize with all suppliers
    this.suppliers = [...this.mockSuppliers];
  }

  toggleSupplierSelection(supplier: any) {
    const supplierId = supplier['Company Name'];
    if (this.selectedSuppliers.has(supplierId)) {
      this.selectedSuppliers.delete(supplierId);
    } else {
      this.selectedSuppliers.add(supplierId);
    }
  }

  toggleSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.searchData.forEach(supplier => {
        this.selectedSuppliers.add(supplier['Company Name']);
      });
    } else {
      this.selectedSuppliers.clear();
    }
  }

  isSupplierSelected(supplier: any): boolean {
    return this.selectedSuppliers.has(supplier['Company Name']);
  }

  openInvitationDialog() {
    this.selectedSuppliersList = this.searchData
      .filter(supplier => this.selectedSuppliers.has(supplier['Company Name']))
      .map(supplier => ({
        supplier_email_id: supplier['Primary Email'],
        supplier_name: supplier['Company Name'],
        company_name: supplier['Company Name'],
        phone_number: supplier['Primary Phone'] || ''
      }));
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to send the invitation to selected supplier(s)?',
      header: 'Confirmation',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.sendInvitations();
      },
      reject: () => {
        // Do nothing if rejected
      }
    });
  }

  sendInvitations() {
    const invitationData = {
      supplier_invitations: this.selectedSuppliersList
    };
    
    // Here you would typically make an API call to send the invitations
    console.log('Sending invitations:', invitationData);
    this.sendInvitation(invitationData);

  }

  sendInvitation(invitationData:any) {
    let endPoint = `/api/resource/wfb_bulk_supplier_invitation`;
    this.service.postData(endPoint, invitationData).subscribe(
      (res:any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invitations sent successfully'
        });
        
        this.showInvitationDialog = false;
        this.selectedSuppliers.clear();
      }
    );
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
}
