import { Component, Output, EventEmitter, Input, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-header.component.html',
  styleUrl: './customer-header.component.scss'
})
export class CustomerHeaderComponent implements OnInit {
  @Input() showMobileMenu: boolean = false;
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() mobileMenuToggle = new EventEmitter<void>();
  @Output() profileEvent = new EventEmitter<void>();
  @Output() helpEvent = new EventEmitter<void>();

  // User properties
  userName: string = localStorage.getItem('customer_company_name') || '';
  userEmail: string = localStorage.getItem('primary_email_id') || '';
  userInitials: string = this.getInitials(this.userName);
  userProfileImage: string = ''; // Can be set to image URL

  // Dropdown states
  isUserDropdownOpen: boolean = false;
  isNotificationDropdownOpen: boolean = false;

  // Sample notifications data
  notifications: Notification[] = [
    {
      id: 1,
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed and is being processed.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'New Quotation Available',
      message: 'A new quotation for your RFQ is available for review.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      isRead: false,
      type: 'info'
    },
    {
      id: 3,
      title: 'Payment Reminder',
      message: 'Payment for invoice #INV-001 is due in 3 days.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: false,
      type: 'warning'
    },
    {
      id: 4,
      title: 'Delivery Update',
      message: 'Your order #12344 has been delivered successfully.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      type: 'success'
    },
    {
      id: 5,
      title: 'Profile Verification',
      message: 'Your company profile has been verified and approved.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: true,
      type: 'success'
    }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeUserData();
  }

  ngOnInit(): void {
    // Initialize component
  }

  private initializeUserData(): void {
    // Get user data from localStorage or service only in browser
    if (isPlatformBrowser(this.platformId)) {
      const storedUserData = localStorage.getItem('customer_user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        this.userName = userData.name || this.userName;
        this.userEmail = userData.email || this.userEmail;
        this.userProfileImage = userData.profileImage || '';
      }
    }
    
    // Generate initials from name
    this.userInitials = this.getInitials(this.userName);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userDropdown = document.querySelector('.user-dropdown');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (!userDropdown?.contains(target)) {
      this.isUserDropdownOpen = false;
    }
    
    if (!notificationDropdown?.contains(target)) {
      this.isNotificationDropdownOpen = false;
    }
  }

  // Dropdown toggles
  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    // Close notification dropdown when opening user dropdown
    if (this.isUserDropdownOpen) {
      this.isNotificationDropdownOpen = false;
    }
  }

  toggleNotificationDropdown(): void {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    // Close user dropdown when opening notification dropdown
    if (this.isNotificationDropdownOpen) {
      this.isUserDropdownOpen = false;
    }
  }

  // Notification methods
  get unreadNotificationCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get sortedNotifications(): Notification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }

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

  onNotificationClick(notification: Notification): void {
    this.markAsRead(notification.id);
    this.isNotificationDropdownOpen = false;
    
    // Handle notification-specific actions
    console.log('Notification clicked:', notification);
    // You can navigate to specific pages based on notification type
  }

  // User action methods
  onProfile(): void {
    this.isUserDropdownOpen = false;
    this.profileEvent.emit();
    console.log('Profile clicked');
    // Navigate to profile page or emit event
  }

  onSettings(): void {
    this.isUserDropdownOpen = false;
    console.log('Settings clicked');
    // Navigate to settings page
    this.router.navigate(['/customer/settings']);
  }

  onBilling(): void {
    this.isUserDropdownOpen = false;
    console.log('Billing clicked');
    // Navigate to billing page
    this.router.navigate(['/customer/billing']);
  }

  onHelp(): void {
    this.helpEvent.emit();
    console.log('Help clicked');
    // Open help modal or navigate to help page
  }

  onLogout(): void {
    this.isUserDropdownOpen = false;
    
    // Clear all auth-related data
    if (isPlatformBrowser(this.platformId)) {
      // Clear all possible auth tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('user_type');
      localStorage.removeItem('customer_user_data');
      localStorage.removeItem('customer_auth_token');
      localStorage.removeItem('customer_session');
      localStorage.removeItem('customer_remember_me');
    }
    
    // Emit logout event to parent component
    this.logoutEvent.emit();
    
    // Navigate to login page with error handling
    this.router.navigate(['/wefab/customer/login'])
      .then(success => {
        if (!success) {
          console.error('Navigation to login page failed');
          // Try alternative navigation
          return this.router.navigate(['wefab/customer/login']);
        }
        return Promise.resolve(success);
      })
      .catch(error => {
        console.error('Error during logout navigation:', error);
        // Force reload as last resort
        window.location.href = '/wefab/customer/login';
      });
  }

  onMobileMenuToggle(): void {
    this.mobileMenuToggle.emit();
  }

  // Utility methods
  private getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  // Method to update user data
  updateUserData(userData: any): void {
    this.userName = userData.name || this.userName;
    this.userEmail = userData.email || this.userEmail;
    this.userProfileImage = userData.profileImage || '';
    this.userInitials = this.getInitials(this.userName);
    
    // Save to localStorage only in browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('customer_user_data', JSON.stringify(userData));
    }
  }

  // Method to add new notification
  addNotification(notification: Omit<Notification, 'id'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Math.max(...this.notifications.map(n => n.id), 0) + 1
    };
    this.notifications.unshift(newNotification);
  }

  // Method to clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
  }
}
