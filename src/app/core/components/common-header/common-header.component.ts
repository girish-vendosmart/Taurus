import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

// Interface for notification structure
interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {
  @Input() title: string = 'Supplier Onboarding Portal';
  @Input() showMobileMenu: boolean = false;
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() mobileMenuToggle = new EventEmitter<void>();

  userType = localStorage.getItem('user_type');
  
  isDropdownOpen = false;
  isNotificationDropdownOpen = false;
  userInitials: string = '';
  // Dummy user data
  dummyUserEmail: string = 'michael.doe@mailinator.com';
  supplierEmailId: any = '';

  // Notification data
  notifications: Notification[] = [
    {
      id: 1,
      title: 'Profile Update Required',
      message: 'Please update your company profile information to complete verification.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      type: 'warning'
    },
    {
      id: 2,
      title: 'New RFQ Available',
      message: 'A new Request for Quotation matching your capabilities is available.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: false,
      type: 'info'
    },
    {
      id: 3,
      title: 'Quotation Approved',
      message: 'Your quotation for Project ABC has been approved by the buyer.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      type: 'success'
    },
    {
      id: 4,
      title: 'Payment Processed',
      message: 'Payment for Order #12345 has been successfully processed.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: true,
      type: 'success'
    },
    {
      id: 5,
      title: 'Document Upload Failed',
      message: 'Failed to upload compliance certificate. Please try again.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: false,
      type: 'error'
    }
  ];

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
    const shouldShow = supplierId !== null && supplierId !== undefined && supplierId.trim() !== '' && this.userType === 'supplier';
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
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (!dropdown?.contains(target)) {
      this.isDropdownOpen = false;
    }
    
    if (!notificationDropdown?.contains(target)) {
      this.isNotificationDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    // Close notification dropdown when opening user dropdown
    if (this.isDropdownOpen) {
      this.isNotificationDropdownOpen = false;
    }
  }

  toggleNotificationDropdown(): void {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    // Close user dropdown when opening notification dropdown
    if (this.isNotificationDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  // Get unread notification count
  get unreadNotificationCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Get notifications sorted by timestamp (newest first)
  get sortedNotifications(): Notification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mark notification as read
  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }

  // Get relative time string
  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffInMilliseconds = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  }

  // Handle notification click
  onNotificationClick(notification: Notification): void {
    this.markAsRead(notification.id);
    this.isNotificationDropdownOpen = false;
    
    // Handle different notification types with navigation
    switch (notification.type) {
      case 'warning':
        if (notification.title.includes('Profile')) {
          this.onProfile();
        }
        break;
      case 'info':
        if (notification.title.includes('RFQ')) {
          this.router.navigate(['/wefab/supplier/rfq']);
        }
        break;
      // Add more navigation logic as needed
    }
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

  onMobileMenuToggle(): void {
    this.mobileMenuToggle.emit();
  }
}
