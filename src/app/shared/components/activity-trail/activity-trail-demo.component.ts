import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityTrailComponent, ActivityLogData } from './activity-trail.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-activity-trail-demo',
  standalone: true,
  imports: [
    CommonModule,
    ActivityTrailComponent,
    ButtonModule
  ],
  template: `
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #1A3A5F; margin-bottom: 2rem;">Activity Trail Component Demo</h1>
      
      <div style="margin-bottom: 1rem;">
        <button pButton type="button" label="Load Sample Data" (click)="loadSampleData()" 
                style="margin-right: 0.5rem; background-color: #1A3A5F; border-color: #1A3A5F;"></button>
        <button pButton type="button" label="Clear Data" (click)="clearData()" 
                class="p-button-secondary" style="margin-left: 0.5rem;"></button>
        <button pButton type="button" label="Toggle Loading" (click)="toggleLoading()" 
                class="p-button-outlined" style="margin-left: 0.5rem;"></button>
      </div>

      <app-activity-trail 
        [activityData]="sampleData"
        [loading]="isLoading"
        [title]="'Activity Trail'"
        [showHeader]="true"
        [maxHeight]="'600px'"
        style="border: 2px solid #1A3A5F; border-radius: 8px; overflow: hidden;">
      </app-activity-trail>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #F6F7F9;
    }
  `]
})
export class ActivityTrailDemoComponent {
  sampleData: ActivityLogData[] = [];
  isLoading: boolean = false;

  loadSampleData(): void {
    this.sampleData = [
      {
        "name": 1001,
        "user": "John Smith",
        "creation": "2024-02-27 23:10:00.654880",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "Workflow State changed from \"Published\" to \"Awarded\""
          ]
        }
      },
      {
        "name": 1000,
        "user": "John Smith",
        "creation": "2024-02-27 22:29:00.178130",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "Workflow State changed from \"Paused\" to \"Published\""
          ]
        }
      },
      {
        "name": 999,
        "user": "John Smith",
        "creation": "2024-02-27 22:28:00.294732",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "1 rows added to RFQ Participants",
            "1 rows added to RFQ Participants",
            "1 rows removed from RFQ Participants"
          ]
        }
      },
      {
        "name": 998,
        "user": "John Smith",
        "creation": "2024-02-27 22:25:00.123456",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "Workflow State changed from \"Published\" to \"Paused\""
          ]
        }
      },
      {
        "name": 997,
        "user": "John Smith",
        "creation": "2024-02-27 22:17:00.987654",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "25 rows modified in pm_scores"
          ]
        }
      },
      {
        "name": 996,
        "user": "System Admin",
        "creation": "2024-02-27 20:15:00.555555",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "Workflow State changed from \"Draft\" to \"Published\""
          ]
        }
      },
      {
        "name": 995,
        "user": "Jane Doe",
        "creation": "2024-02-27 18:30:00.444444",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "5 rows added to supplier_qualifications",
            "2 rows removed from pending_approvals"
          ]
        }
      },
      {
        "name": 994,
        "user": "Mike Johnson",
        "creation": "2024-02-27 16:45:00.333333",
        "time_since": "92 days ago",
        "data": {
          "changed": [
            "Profile information updated with new contact details"
          ]
        }
      }
    ];
  }

  clearData(): void {
    this.sampleData = [];
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }
} 