import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../app/core/services/auth.service';


@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {
  @Input() title: string = 'Supplier Onboarding Portal';
  @Output() logoutEvent = new EventEmitter<void>();

  constructor(private router: Router,     public authService: AuthService,  ) {}

  onLogout(): void {
    // Emit logout event for parent components to handle
    this.logoutEvent.emit();
    
    // Default logout behavior - can be customized
    this.performLogout();
  }

  private performLogout(): void {
    // Logout from the auth service
    this.authService.logout().subscribe();
    
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
