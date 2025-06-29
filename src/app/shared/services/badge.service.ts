import { Injectable } from '@angular/core';

export interface BadgeConfig {
  text: string;
  type: BadgeType;
  customClass?: string;
  icon?: string;
  clickable?: boolean;
}

export type BadgeType = 
  | 'status-draft' 
  | 'status-open' 
  | 'status-progress' 
  | 'status-closed' 
  | 'status-awarded' 
  | 'status-approved' 
  | 'status-rejected' 
  | 'status-pending' 
  | 'status-review'
  | 'status-deactivate'
  | 'status-paused'
  | 'status-default'
  | 'activity-state-change'
  | 'activity-data-modified'
  | 'activity-rows-updated'
  | 'activity-default'
  | 'verification-verified'
  | 'verification-not-verified'
  | 'verification-analyzing'
  | 'level-badge'
  | 'notification-badge'
  | 'message-comment'
  | 'message-action-update';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  constructor() { }

  /**
   * Get badge class based on status string
   * @param status - Status string to convert to badge class
   * @returns Badge class name
   */
  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    
    // Convert to lowercase and replace spaces with hyphens
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    
    switch (normalizedStatus) {
      // Order statuses
      case 'order-complete':
      case 'order-completed':
        return 'status-approved';
      case 'dispatch':
      case 'finishing':
      case 'preparation':
      case 'work-in-progress':
      case 'quality-inspection':
      case 'in-progress':
        return 'status-progress';
      case 'supplier-confirmation':
      case 'not-opened':
      case 'invited':
      case 'opened':
      case 'open':
        return 'status-open';
      
      // General statuses
      case 'published':
      case 'approved':
        return 'status-approved';
      case 'deactivated':
      case 'deactivate':
        return 'status-deactivate';
      case 'paused':
        return 'status-paused';
      case 'not-started':
      case 'draft':
        return 'status-draft';
      case 'under-review':
      case 'review':
        return 'status-review';
      case 'rejected':
      case 'cancelled':
        return 'status-rejected';
      case 'closed':
        return 'status-closed';
      case 'awarded':
      case 'quoted':
      case 'submitted':
        return 'status-awarded';
      case 'pending':
        return 'status-pending';
      
      // Additional common statuses
      case 'published':
        return 'status-approved';
      case 'active':
        return 'status-open';
      case 'inactive':
        return 'status-closed';
      case 'processing':
        return 'status-progress';
      case 'completed':
        return 'status-approved';
      case 'failed':
        return 'status-rejected';
      
      // Conversation trail specific
      case 'supplier-confirmation':
        return 'status-open';
      case 'work-in-progress':
      case 'finishing':
      case 'preparation':
      case 'quality-inspection':
      case 'dispatch':
        return 'status-progress';
      case 'order-completed':
        return 'status-approved';
      case 'not-opened':
        return 'status-open';
      
      default:
        return 'status-default';
    }
  }

  /**
   * Get activity badge class based on activity type
   * @param activityType - Type of activity
   * @returns Activity badge class name
   */
  getActivityBadgeClass(activityType: string): string {
    if (!activityType) return 'activity-default';
    
    const normalizedType = activityType.toLowerCase().replace(/\s+/g, '-');
    
    switch (normalizedType) {
      case 'state-change':
      case 'status-change':
        return 'activity-state-change';
      case 'data-modified':
      case 'data-updated':
        return 'activity-data-modified';
      case 'rows-updated':
      case 'bulk-update':
        return 'activity-rows-updated';
      default:
        return 'activity-default';
    }
  }

  /**
   * Get verification badge class based on verification status
   * @param verificationStatus - Verification status
   * @returns Verification badge class name
   */
  getVerificationBadgeClass(verificationStatus: string): string {
    if (!verificationStatus) return 'verification-not-verified';
    
    const normalizedStatus = verificationStatus.toLowerCase().replace(/\s+/g, '-');
    
    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
        return 'verification-verified';
      case 'analyzing':
      case 'pending':
      case 'in-progress':
        return 'verification-analyzing';
      case 'not-verified':
      case 'rejected':
      case 'failed':
      default:
        return 'verification-not-verified';
    }
  }

  /**
   * Get message type badge class
   * @param messageType - Type of message
   * @returns Message badge class name
   */
  getMessageTypeBadgeClass(messageType: string): string {
    if (!messageType) return 'message-comment';
    
    const normalizedType = messageType.toLowerCase().replace(/\s+/g, '-');
    
    switch (normalizedType) {
      case 'comment':
        return 'message-comment';
      case 'action-update':
      case 'status-update':
        return 'message-action-update';
      default:
        return 'message-comment';
    }
  }

  /**
   * Create a badge configuration object
   * @param text - Badge text
   * @param type - Badge type
   * @param options - Additional options
   * @returns Badge configuration
   */
  createBadgeConfig(text: string, type: BadgeType, options: Partial<BadgeConfig> = {}): BadgeConfig {
    return {
      text,
      type,
      customClass: options.customClass,
      icon: options.icon,
      clickable: options.clickable || false
    };
  }

  /**
   * Get badge configuration for status
   * @param status - Status string
   * @returns Badge configuration
   */
  getStatusBadgeConfig(status: string): BadgeConfig {
    const badgeClass = this.getStatusClass(status);
    return this.createBadgeConfig(status, badgeClass as BadgeType);
  }

  /**
   * Get all available badge types
   * @returns Array of all badge types
   */
  getAllBadgeTypes(): BadgeType[] {
    return [
      'status-draft',
      'status-open',
      'status-progress',
      'status-closed',
      'status-awarded',
      'status-approved',
      'status-rejected',
      'status-pending',
      'status-review',
      'status-deactivate',
      'status-paused',
      'status-default',
      'activity-state-change',
      'activity-data-modified',
      'activity-rows-updated',
      'activity-default',
      'verification-verified',
      'verification-not-verified',
      'verification-analyzing',
      'level-badge',
      'notification-badge',
      'message-comment',
      'message-action-update'
    ];
  }

  /**
   * Check if badge type is a status badge
   * @param type - Badge type
   * @returns True if it's a status badge
   */
  isStatusBadge(type: BadgeType): boolean {
    return type.startsWith('status-');
  }

  /**
   * Check if badge type is an activity badge
   * @param type - Badge type
   * @returns True if it's an activity badge
   */
  isActivityBadge(type: BadgeType): boolean {
    return type.startsWith('activity-');
  }

  /**
   * Check if badge type is a verification badge
   * @param type - Badge type
   * @returns True if it's a verification badge
   */
  isVerificationBadge(type: BadgeType): boolean {
    return type.startsWith('verification-');
  }
} 