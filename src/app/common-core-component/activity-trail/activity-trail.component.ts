import { Component, Input, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';

// Interface for the raw activity log data from API
export interface ActivityLogData {
  name: number;
  user: string;
  creation: string;
  time_since: string;
  data: {
    changed: string[];
  };
}

// Interface for processed activity item for display
export interface ActivityItem {
  id: string;
  date: Date;
  action: 'Approved' | 'Rejected' | 'Updated' | 'Submitted' | 'Created' | 'Under Review';
  title: string;
  description: string;
  user: string;
  level?: string;
  section?: string;
  time_since: string;
  changes?: string[];
}

@Component({
  selector: 'app-activity-trail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    RippleModule
  ],
  templateUrl: './activity-trail.component.html',
  styleUrls: ['./activity-trail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTrailComponent implements OnInit, OnChanges {
  @Input() activityData: ActivityLogData[] = [];
  @Input() loading: boolean = false;
  @Input() title: string = 'Activity Trail';
  @Input() showHeader: boolean = true;
  @Input() maxHeight: string = '400px';
  @Input() emptyMessage: string = 'No activity found';

  processedActivities: ActivityItem[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.processActivityData();
  }

  ngOnChanges(): void {
    this.processActivityData();
  }

  private processActivityData(): void {
    if (!this.activityData || this.activityData.length === 0) {
      this.processedActivities = [];
      this.cdr.detectChanges();
      return;
    }

    this.processedActivities = this.activityData.map((log: ActivityLogData, index: number) => {
      const action = this.mapLogAction(log);
      const title = this.generateLogTitle(log, action);
      const description = this.generateLogDescription(log, action);
      
      return {
        id: log.name.toString(),
        date: new Date(log.creation),
        action: action,
        title: title,
        description: description,
        user: log.user || 'System',
        time_since: log.time_since || this.calculateTimeSince(new Date(log.creation)),
        changes: log.data?.changed || []
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first

    this.cdr.detectChanges();
  }

  private mapLogAction(log: ActivityLogData): 'Approved' | 'Rejected' | 'Updated' | 'Submitted' | 'Created' | 'Under Review' {
    if (!log.data?.changed || log.data.changed.length === 0) {
      return 'Created';
    }

    const changes = log.data.changed.join(' ').toLowerCase();
    
    // Check for status changes first
    if (changes.includes('onboarding status')) {
      if (changes.includes('approved')) return 'Approved';
      if (changes.includes('rejected')) return 'Rejected';
      if (changes.includes('under review')) return 'Under Review';
      if (changes.includes('request to resubmit')) return 'Updated';
      return 'Submitted';
    }
    
    // Check for profile/data changes
    if (changes.includes('company profile') || changes.includes('profile changed')) {
      return 'Updated';
    }
    
    // Default to Created for initial entries
    return 'Created';
  }

  private generateLogTitle(log: ActivityLogData, action: string): string {
    const stage = this.getStageFromLog(log);
    
    switch (action) {
      case 'Approved':
        return `${stage} Approved`;
      case 'Rejected':
        return `${stage} Rejected`;
      case 'Under Review':
        return `${stage} Under Review`;
      case 'Updated':
        return `${stage} Updated`;
      case 'Submitted':
        return `${stage} Submitted`;
      default:
        return `${stage} Created`;
    }
  }

  private generateLogDescription(log: ActivityLogData, action: string): string {
    if (!log.data?.changed || log.data.changed.length === 0) {
      return `Record was created in the system`;
    }

    // For status changes, extract the specific status change
    const statusChange = log.data.changed.find(change => 
      change.toLowerCase().includes('onboarding status')
    );
    
    if (statusChange) {
      return this.formatStatusChange(statusChange);
    }

    // For profile changes, provide a more user-friendly message
    const profileChange = log.data.changed.find(change => 
      change.toLowerCase().includes('company profile changed') ||
      change.toLowerCase().includes('profile changed')
    );
    
    if (profileChange) {
      // Check if it's a long JSON change
      if (profileChange.length > 200 || profileChange.includes('{')) {
        return 'Company profile information was updated with new details';
      }
      return 'Profile information was updated';
    }

    // For other changes, use the first change but truncate if too long
    const firstChange = log.data.changed[0];
    if (firstChange.length > 150) {
      return 'System data was updated';
    }

    return firstChange || 'Activity recorded';
  }

  private formatStatusChange(statusChange: string): string {
    // Extract the status change details
    const match = statusChange.match(/from\s+"([^"]+)"\s+to\s+"([^"]+)"/i);
    if (match) {
      const fromStatus = match[1];
      const toStatus = match[2];
      return `Status changed from "${fromStatus}" to "${toStatus}"`;
    }
    return statusChange;
  }

  private getStageFromLog(log: ActivityLogData): string {
    // Try to determine stage from the log context or changes
    const changes = log.data?.changed?.join(' ').toLowerCase() || '';
    
    if (changes.includes('l1') || changes.includes('basic')) {
      return 'Basic Information';
    }
    if (changes.includes('l2') || changes.includes('manufacturing')) {
      return 'Manufacturing Capabilities';
    }
    if (changes.includes('l3') || changes.includes('financial')) {
      return 'Financial Information';
    }
    
    // Default to Profile if stage cannot be determined
    return 'Profile';
  }

  private calculateTimeSince(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Status helper methods for styling
  getStatusColorClass(action: string): string {
    const statusMap: { [key: string]: string } = {
      'Approved': 'status-approved',
      'Rejected': 'status-rejected',
      'Under Review': 'status-under-review',
      'Updated': 'status-updated',
      'Submitted': 'status-submitted',
      'Created': 'status-created'
    };
    return statusMap[action] || 'status-created';
  }

  getStatusIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'Approved': 'pi-check-circle',
      'Rejected': 'pi-times-circle',
      'Under Review': 'pi-clock',
      'Updated': 'pi-sync',
      'Submitted': 'pi-upload',
      'Created': 'pi-plus-circle'
    };
    return iconMap[action] || 'pi-circle';
  }

  // TrackBy function for performance
  trackByActivityId(index: number, activity: ActivityItem): string {
    return activity.id;
  }

  // Method to refresh activity data (can be called from parent)
  refresh(): void {
    this.processActivityData();
  }

  // Helper method to check if changes contain long profile data
  isLongProfileChange(changes: string[]): boolean {
    if (!changes || changes.length === 0) return false;
    
    return changes.some(change => 
      change.length > 200 || // Very long changes
      change.includes('Company Profile changed from') || // Profile updates
      change.includes('{') || // JSON data
      change.includes('\\\"') // Escaped JSON
    );
  }
} 