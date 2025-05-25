import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {
  @Output() logoutEvent = new EventEmitter<void>();

  constructor(private router: Router) {}

  onLogout(): void {
    // Emit logout event for parent components to handle
    this.logoutEvent.emit();
    
    // Default logout behavior - can be customized
    this.performLogout();
  }

  private performLogout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Navigate to login page or home page
    this.router.navigate(['/login']).catch(error => {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = '/login';
    });
  }
}
