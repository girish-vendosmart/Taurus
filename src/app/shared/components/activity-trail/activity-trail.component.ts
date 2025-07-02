import { Component, Input, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

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

// Enhanced interface for processed activity item for display
export interface ActivityItem {
  id: string;
  date: Date;
  action: 'State Change' | 'Data Modified' | 'Rows Updated' | 'Created' | 'Approved' | 'Rejected' | 'Submitted';
  title: string;
  description: string;
  user: string;
  level?: 'critical' | 'important' | 'normal' | 'minor';
  section?: string;
  time_since: string;
  changes?: string[];
  priority?: number;
}

// Filter options interface
export interface ActivityFilter {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-activity-trail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    DateFormatPipe
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
  @Input() showSearch: boolean = false;
  @Input() showFilter: boolean = false;
  @Input() pageSize: number = 20;
  @Input() enableVirtualScroll: boolean = false;
  @Input() animateEntries: boolean = true;

  @Output() activityClick = new EventEmitter<ActivityItem>();
  @Output() userClick = new EventEmitter<string>();
  @Output() refreshRequested = new EventEmitter<void>();

  processedActivities: ActivityItem[] = [];
  filteredActivities: ActivityItem[] = [];
  displayedActivities: ActivityItem[] = [];
  
  // Filter and search states
  searchTerm: string = '';
  selectedFilter: string | null = null;
  currentPage: number = 0;
  
  // Filter options
  filterOptions: ActivityFilter[] = [
    { label: 'All Activities', value: null },
    { label: 'State Changes', value: 'State Change' },
    { label: 'Data Modified', value: 'Data Modified' },
    { label: 'Rows Updated', value: 'Rows Updated' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Created', value: 'Created' }
  ];

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
      this.filteredActivities = [];
      this.displayedActivities = [];
      this.cdr.detectChanges();
      return;
    }

    this.processedActivities = this.activityData.map((log: ActivityLogData) => {
      const action = this.mapLogAction(log);
      const description = this.generateLogDescription(log, action);
      const priority = this.calculatePriority(log, action);
      const level = this.determineLevel(log, action);
      
      return {
        id: log.name.toString(),
        date: new Date(log.creation),
        action: action,
        title: this.generateTitle(action),
        description: description,
        user: log.user || 'System',
        level: level,
        time_since: log.time_since || this.calculateTimeSince(new Date(log.creation)),
        changes: log.data?.changed || [],
        priority: priority
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first

    this.applyFiltersAndSearch();
  }

  private mapLogAction(log: ActivityLogData): 'State Change' | 'Data Modified' | 'Rows Updated' | 'Created' | 'Approved' | 'Rejected' | 'Submitted' {
    if (!log.data?.changed || log.data.changed.length === 0) {
      return 'Created';
    }

    const changes = log.data.changed.join(' ').toLowerCase();
    
    // Check for specific approval statuses
    if (changes.includes('approved') || changes.includes('to "approved"')) {
      return 'Approved';
    }
    
    if (changes.includes('rejected') || changes.includes('to "rejected"')) {
      return 'Rejected';
    }
    
    if (changes.includes('submitted') || changes.includes('to "submitted"')) {
      return 'Submitted';
    }
    
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
    if (action === 'State Change' || action === 'Approved' || action === 'Rejected' || action === 'Submitted') {
      if (firstChange.includes('Workflow State changed') || firstChange.includes('status changed') || firstChange.includes('Status changed')) {
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

  private generateTitle(action: string): string {
    const titleMap: { [key: string]: string } = {
      'State Change': 'Status Update',
      'Data Modified': 'Data Update',
      'Rows Updated': 'Records Updated',
      'Created': 'Record Created',
      'Approved': 'Approval Granted',
      'Rejected': 'Request Rejected',
      'Submitted': 'Submission Made'
    };
    return titleMap[action] || 'Activity';
  }

  private calculatePriority(log: ActivityLogData, action: string): number {
    // Higher number = higher priority
    const priorityMap: { [key: string]: number } = {
      'Approved': 5,
      'Rejected': 5,
      'State Change': 4,
      'Submitted': 3,
      'Data Modified': 2,
      'Rows Updated': 2,
      'Created': 1
    };
    return priorityMap[action] || 1;
  }

  private determineLevel(log: ActivityLogData, action: string): 'critical' | 'important' | 'normal' | 'minor' {
    if (action === 'Approved' || action === 'Rejected') {
      return 'critical';
    }
    if (action === 'State Change' || action === 'Submitted') {
      return 'important';
    }
    if (action === 'Data Modified') {
      return 'normal';
    }
    return 'minor';
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

  // Filter and search methods
  private applyFiltersAndSearch(): void {
    let filtered = [...this.processedActivities];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchLower) ||
        activity.user.toLowerCase().includes(searchLower) ||
        activity.action.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (this.selectedFilter && this.selectedFilter !== null) {
      filtered = filtered.filter(activity => activity.action === this.selectedFilter);
    }

    this.filteredActivities = filtered;
    this.updateDisplayedActivities();
  }

  private updateDisplayedActivities(): void {
    if (!this.enableVirtualScroll) {
      this.displayedActivities = [...this.filteredActivities];
    } else {
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.displayedActivities = this.filteredActivities.slice(startIndex, endIndex);
    }
    this.cdr.detectChanges();
  }

  // Public methods for search and filtering
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 0;
    this.applyFiltersAndSearch();
  }

  onFilterChange(filter: ActivityFilter): void {
    this.selectedFilter = filter.value;
    this.currentPage = 0;
    this.applyFiltersAndSearch();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.applyFiltersAndSearch();
  }

  loadMore(): void {
    if (this.enableVirtualScroll && this.hasMoreItems()) {
      this.currentPage++;
      this.updateDisplayedActivities();
    }
  }

  hasMoreItems(): boolean {
    return this.enableVirtualScroll && 
           ((this.currentPage + 1) * this.pageSize) < this.filteredActivities.length;
  }

  // UI helper methods
  getActivityBadgeText(action: string): string {
    return action;
  }

  getActivityBadgeClass(action: string): string {
    const classMap: { [key: string]: string } = {
      'State Change': 'badge-state-change',
      'Data Modified': 'badge-data-modified',
      'Rows Updated': 'badge-rows-updated',
      'Created': 'badge-created',
      'Approved': 'badge-approved',
      'Rejected': 'badge-rejected',
      'Submitted': 'badge-submitted'
    };
    return classMap[action] || 'badge-default';
  }

  getTimelineDotClass(action: string): string {
    const classMap: { [key: string]: string } = {
      'State Change': 'dot-state-change',
      'Data Modified': 'dot-data-modified',
      'Rows Updated': 'dot-rows-updated',
      'Created': 'dot-created',
      'Approved': 'dot-approved',
      'Rejected': 'dot-rejected',
      'Submitted': 'dot-submitted'
    };
    return classMap[action] || 'dot-default';
  }

  getActivityIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'State Change': 'pi pi-sync',
      'Data Modified': 'pi pi-pencil',
      'Rows Updated': 'pi pi-table',
      'Created': 'pi pi-plus-circle',
      'Approved': 'pi pi-check-circle',
      'Rejected': 'pi pi-times-circle',
      'Submitted': 'pi pi-upload'
    };
    return iconMap[action] || 'pi pi-circle';
  }

  getLevelClass(level: string | undefined): string {
    if (!level) return '';
    return `level-${level}`;
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

  // Event handlers
  onActivityClick(activity: ActivityItem): void {
    this.activityClick.emit(activity);
  }

  onUserClick(userName: string): void {
    this.userClick.emit(userName);
  }

  // TrackBy function for performance
  trackByActivityId(index: number, activity: ActivityItem): string {
    return activity.id;
  }

  // Method to refresh activity data (can be called from parent)
  refresh(): void {
    this.refreshRequested.emit();
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

  // Accessibility methods
  getActivityAriaLabel(activity: ActivityItem): string {
    return `${activity.action} by ${activity.user} on ${activity.date.toLocaleDateString()}. ${activity.description}`;
  }

  getUserAriaLabel(userName: string): string {
    return `View activities by ${userName}`;
  }
} 