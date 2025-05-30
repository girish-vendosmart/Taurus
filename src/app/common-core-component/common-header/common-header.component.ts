import { Component, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../app/core/services/auth.service';

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
    // Supplier email id
    this.supplierEmailId = sessionStorage.getItem('primary_email_id');
    // Set initials using dummy data
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
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  onProfile(): void {
    this.isDropdownOpen = false;
    console.log('Profile clicked for user:', this.dummyUserEmail);
    this.router.navigate(['/wefab/supplier/profile-review']);
    // For demo purposes, just log instead of navigation
    // this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.isDropdownOpen = false;
    console.log('Logout clicked');
    this.logoutEvent.emit();
    this.performLogout();
  }

  private performLogout(): void {
    console.log('Performing logout for user:', this.dummyUserEmail);
    
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Navigate to login page or home page
    this.router.navigate(['/wefab/supplier/login']).catch(error => {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = '/login';
    });
  }
}
