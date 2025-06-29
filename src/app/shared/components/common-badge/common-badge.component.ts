import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService, BadgeConfig, BadgeType } from '../../services/badge.service';

@Component({
  selector: 'app-common-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      [class]="getBadgeClasses()" 
      [title]="tooltip"
      (click)="handleClick()"
      [attr.aria-label]="text">
      <i *ngIf="icon" [class]="icon"></i>
      {{ text }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class CommonBadgeComponent implements OnInit {
  @Input() text: string = '';
  @Input() type: BadgeType = 'status-default';
  @Input() icon?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'sm';
  @Input() shape: 'default' | 'pill' | 'square' | 'rounded' = 'default';
  @Input() clickable: boolean = false;
  @Input() customClass?: string;
  @Input() tooltip?: string;
  
  // For automatic status detection
  @Input() status?: string;
  @Input() activityType?: string;
  @Input() verificationStatus?: string;
  @Input() messageType?: string;

  constructor(private badgeService: BadgeService) {}

  ngOnInit() {
    // Auto-detect badge type based on provided inputs
    if (this.status && !this.type) {
      this.type = this.badgeService.getStatusClass(this.status) as BadgeType;
    } else if (this.activityType && !this.type) {
      this.type = this.badgeService.getActivityBadgeClass(this.activityType) as BadgeType;
    } else if (this.verificationStatus && !this.type) {
      this.type = this.badgeService.getVerificationBadgeClass(this.verificationStatus) as BadgeType;
    } else if (this.messageType && !this.type) {
      this.type = this.badgeService.getMessageTypeBadgeClass(this.messageType) as BadgeType;
    }

    // Use status text if no text provided
    if (!this.text && this.status) {
      this.text = this.status;
    } else if (!this.text && this.activityType) {
      this.text = this.activityType;
    } else if (!this.text && this.verificationStatus) {
      this.text = this.verificationStatus;
    } else if (!this.text && this.messageType) {
      this.text = this.messageType;
    }
  }

  getBadgeClasses(): string {
    const classes = ['badge-base'];
    
    // Add primary badge class based on type
    if (this.badgeService.isStatusBadge(this.type)) {
      classes.push('status-badge');
    } else if (this.badgeService.isActivityBadge(this.type)) {
      classes.push('activity-badge');
    } else if (this.badgeService.isVerificationBadge(this.type)) {
      classes.push('verification-badge');
    } else if (this.type.startsWith('message-')) {
      classes.push('message-type-badge');
    } else if (this.type === 'notification-badge') {
      classes.push('notification-badge');
    } else if (this.type === 'level-badge') {
      classes.push('level-badge');
    }
    
    // Add specific type class
    classes.push(this.type);
    
    // Add size class
    classes.push(`badge-${this.size}`);
    
    // Add shape class
    if (this.shape !== 'default') {
      classes.push(`badge-${this.shape}`);
    }
    
    // Add clickable class
    if (this.clickable) {
      classes.push('badge-clickable');
    }
    
    // Add icon class if icon is present
    if (this.icon) {
      classes.push('badge-with-icon');
    }
    
    // Add custom class
    if (this.customClass) {
      classes.push(this.customClass);
    }
    
    return classes.join(' ');
  }

  handleClick() {
    if (this.clickable) {
      // Could emit an event here if needed
      console.log('Badge clicked:', this.text);
    }
  }
} 