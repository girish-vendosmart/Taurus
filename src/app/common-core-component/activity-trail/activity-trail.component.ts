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
  action: 'State Change' | 'Data Modified' | 'Rows Updated';
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
      const description = this.generateLogDescription(log, action);
      
      return {
        id: log.name.toString(),
        date: new Date(log.creation),
        action: action,
        title: '',
        description: description,
        user: log.user || 'System',
        time_since: log.time_since || this.calculateTimeSince(new Date(log.creation)),
        changes: log.data?.changed || []
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first

    this.cdr.detectChanges();
  }

  private mapLogAction(log: ActivityLogData): 'State Change' | 'Data Modified' | 'Rows Updated' {
    if (!log.data?.changed || log.data.changed.length === 0) {
      return 'Data Modified';
    }

    const changes = log.data.changed.join(' ').toLowerCase();
    
    // Check for state changes
    if (changes.includes('workflow state') || changes.includes('onboarding status') || 
        changes.includes('state changed') || changes.includes('status changed')) {
      return 'State Change';
    }
    
    // Check for row updates
    if (changes.includes('rows modified') || changes.includes('rows updated') || 
        changes.includes('rows added') || changes.includes('rows removed')) {
      return 'Rows Updated';
    }
    
    // Default to data modified
    return 'Data Modified';
  }

  private generateLogDescription(log: ActivityLogData, action: string): string {
    if (!log.data?.changed || log.data.changed.length === 0) {
      return 'Record was created in the system';
    }

    const firstChange = log.data.changed[0];

    // For state changes, extract and format the change
    if (action === 'State Change') {
      if (firstChange.includes('Workflow State changed') || firstChange.includes('status changed')) {
        return firstChange;
      }
    }

    // For rows updated
    if (action === 'Rows Updated') {
      return firstChange;
    }

    // For data modified, provide a summary or the first change
    if (firstChange.length > 200 || firstChange.includes('{')) {
      return 'Data was updated with new information';
    }

    return firstChange;
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

  // New methods for the redesigned UI
  getActivityBadgeText(action: string): string {
    return action;
  }

  getActivityBadgeClass(action: string): string {
    const classMap: { [key: string]: string } = {
      'State Change': 'badge-state-change',
      'Data Modified': 'badge-data-modified',
      'Rows Updated': 'badge-rows-updated'
    };
    return classMap[action] || 'badge-default';
  }

  getTimelineDotClass(action: string): string {
    const classMap: { [key: string]: string } = {
      'State Change': 'dot-state-change',
      'Data Modified': 'dot-data-modified',
      'Rows Updated': 'dot-rows-updated'
    };
    return classMap[action] || 'dot-default';
  }

  getActivityIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'State Change': 'pi pi-sync',
      'Data Modified': 'pi pi-plus',
      'Rows Updated': 'pi pi-pencil'
    };
    return iconMap[action] || 'pi pi-circle';
  }

  getUserInitials(userName: string): string {
    if (!userName) return 'U';
    
    const words = userName.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return userName.charAt(0).toUpperCase();
  }

  getChangeIndicator(change: string): string {
    const lowerChange = change.toLowerCase();
    if (lowerChange.includes('added') || lowerChange.includes('created')) {
      return 'indicator-added';
    }
    if (lowerChange.includes('removed') || lowerChange.includes('deleted')) {
      return 'indicator-removed';
    }
    return 'indicator-modified';
  }

  getChangeSymbol(change: string): string {
    const lowerChange = change.toLowerCase();
    if (lowerChange.includes('added') || lowerChange.includes('created')) {
      return '+';
    }
    if (lowerChange.includes('removed') || lowerChange.includes('deleted')) {
      return '−';
    }
    return '•';
  }

  formatChangeText(change: string): string {
    // Remove any JSON or overly technical formatting
    if (change.length > 100 || change.includes('{')) {
      if (change.includes('rows added')) {
        return change.substring(0, change.indexOf(' to ') + 20) + '...';
      }
      return 'Data updated';
    }
    return change;
  }

  // TrackBy function for performance
  trackByActivityId(index: number, activity: ActivityItem): string {
    return activity.id;
  }

  // Method to refresh activity data (can be called from parent)
  refresh(): void {
    this.processActivityData();
  }

  // Legacy methods for compatibility (can be removed if not used elsewhere)
  getStatusColorClass(action: string): string {
    return this.getActivityBadgeClass(action);
  }

  getStatusIcon(action: string): string {
    return this.getActivityIcon(action);
  }

  isLongProfileChange(changes: string[]): boolean {
    if (!changes || changes.length === 0) return false;
    
    return changes.some(change => 
      change.length > 200 || 
      change.includes('{') || 
      change.includes('\\\"')
    );
  }
} 