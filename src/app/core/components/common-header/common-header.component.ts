import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {
  @Input() title: string = 'Supplier Onboarding Portal';
  @Output() logoutEvent = new EventEmitter<void>();
  
  isDropdownOpen = false;
  userInitials: string = '';
  // Dummy user data
  dummyUserEmail: string = 'michael.doe@mailinator.com';
  supplierEmailId: any = '';

  constructor(
    private router: Router,
    public authService: AuthService,
  ) {
    this.initializeUserData();
  }

  // Getter to dynamically check supplier_id from localStorage
  get supplierId(): string | null {
    const supplierId = localStorage.getItem('supplier_id');
    console.log('🔍 supplierId getter called - Current value:', supplierId);
    return supplierId;
  }

  // Getter to check if supplier profile should be shown
  get shouldShowProfile(): boolean {
    const supplierId = this.supplierId;
    const shouldShow = supplierId !== null && supplierId !== undefined && supplierId.trim() !== '';
    console.log('👁️ shouldShowProfile getter called - Should show:', shouldShow);
    return shouldShow;
  }

  private initializeUserData(): void {
    // Supplier email id
    this.supplierEmailId = localStorage.getItem('primary_email_id') || this.dummyUserEmail;
    // Set initials using email data
    this.userInitials = this.getInitials(this.supplierEmailId);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.avatar-dropdown');
    if (!dropdown?.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getInitials(email: string): string {
    if (!email) {
      return 'U'; // Default for 'User'
    }
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  onProfile(): void {
    this.isDropdownOpen = false;
    const currentSupplierId = this.supplierId;
    
    if (!currentSupplierId) {
      console.error('Supplier ID not found in localStorage');
      return;
    }
    
    console.log('Profile clicked for supplier ID:', currentSupplierId);
    this.router.navigate(['/wefab/supplier/profile-review/', currentSupplierId]);
  }

  onLogout(): void {
    this.isDropdownOpen = false;
    console.log('Logout clicked');
    this.logoutEvent.emit();
    this.performLogout();
    localStorage.clear();
  }

  // Test method to demonstrate automatic getter calls
  testSupplierIdChanges(): void {
    console.log('🧪 Testing automatic getter calls...');
    
    // Test 1: Remove supplier_id
    console.log('📤 Removing supplier_id from localStorage...');
    localStorage.removeItem('supplier_id');
    
    // Test 2: Add supplier_id
    setTimeout(() => {
      console.log('📥 Adding supplier_id to localStorage...');
      localStorage.setItem('supplier_id', 'test-supplier-123');
    }, 2000);
    
    // Test 3: Clear supplier_id again
    setTimeout(() => {
      console.log('🗑️ Clearing supplier_id from localStorage...');
      localStorage.removeItem('supplier_id');
    }, 4000);
  }

  private performLogout(): void {
    console.log('Performing logout for user:', this.dummyUserEmail);
    
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('token');
    
    // Navigate to login page or home page
    this.router.navigate(['/wefab/supplier/login']).catch(error => {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = '/login';
    });
  }

  onHelp() {
    this.router.navigate(['/wefab/supplier/help']);
  }
}
