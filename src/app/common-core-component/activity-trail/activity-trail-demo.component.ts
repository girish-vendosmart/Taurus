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
      <h1>Activity Trail Component Demo</h1>
      
      <div style="margin-bottom: 1rem;">
        <button pButton type="button" label="Load Sample Data" (click)="loadSampleData()"></button>
        <button pButton type="button" label="Clear Data" (click)="clearData()" class="p-button-secondary" style="margin-left: 0.5rem;"></button>
        <button pButton type="button" label="Toggle Loading" (click)="toggleLoading()" class="p-button-outlined" style="margin-left: 0.5rem;"></button>
      </div>

      <app-activity-trail 
        [activityData]="sampleData"
        [loading]="isLoading"
        [title]="'Supplier Activity Trail'"
        [showHeader]="true"
        [maxHeight]="'600px'">
      </app-activity-trail>
    </div>
  `
})
export class ActivityTrailDemoComponent {
  sampleData: ActivityLogData[] = [];
  isLoading: boolean = false;

  loadSampleData(): void {
    this.sampleData = [
      {
        "name": 874,
        "user": "Buyer",
        "creation": "2025-05-18 23:48:31.654880",
        "time_since": "9 days ago",
        "data": {
          "changed": [
            "Onboarding Status changed from \"Under Review\" to \"Approved\""
          ]
        }
      },
      {
        "name": 873,
        "user": "Buyer",
        "creation": "2025-05-18 23:47:53.178130",
        "time_since": "9 days ago",
        "data": {
          "changed": [
            "Onboarding Status changed from \"Under Review\" to \"Approved\""
          ]
        }
      },
      {
        "name": 872,
        "user": "ProqSmart Supplier",
        "creation": "2025-05-18 23:00:03.294732",
        "time_since": "9 days ago",
        "data": {
          "changed": [
            "Company Profile changed from \"{\\\"primary_email_id\\\":\\\"proqsmartsupplier@mailinator.com\\\",\\\"noGst\\\":false,\\\"gstinNumber\\\":\\\"29AAGCV9503N1ZM\\\",\\\"company_name\\\":\\\"VendoSmart Technology Pvt Ltd\\\",\\\"registeredAddress\\\":{\\\"fullAddress\\\":\\\"Jbr Tech Park, Jbr Tech Park, KIADB Export Promotion Industrial Area, Whitefield, Bengaluru, Karnataka 560066, India\\\",\\\"placeId\\\":\\\"ChIJk9wNMAURrjsR8PGi9rYiAns\\\",\\\"streetNumber\\\":\\\"\\\",\\\"street\\\":\\\"\\\",\\\"city\\\":\\\"Bengaluru\\\",\\\"state\\\":\\\"Karnataka\\\",\\\"stateCode\\\":\\\"KA\\\",\\\"postalCode\\\":\\\"560066\\\",\\\"country\\\":\\\"India\\\",\\\"countryCode\\\":\\\"IN\\\",\\\"location\\\":{\\\"lat\\\":12.9782954,\\\"lng\\\":77.72758440000001}},\\\"country\\\":\\\"India\\\",\\\"state\\\":\\\"Karnataka\\\",\\\"city\\\":\\\"Bangalore\\\",\\\"primaryManufacturingProcess\\\":[\\\"cnc_machining\\\",\\\"injection_molding\\\"],\\\"primaryContactName\\\":\\\"Vishal Patil\\\",\\\"phoneNumber\\\":\\\"8273995825\\\",\\\"websiteURL\\\":\\\"http://localhost:4200/wefab/supplier/supplier-onboarding\\\",\\\"linkedinURL\\\":\\\"https://sprints.zoho.in/workspace/vendosmart#P13/itemdetails/I70/description\\\",\\\"companyDocuments\\\":[{\\\"name\\\":\\\"Angular_14_Migration_Handover_Document.pdf\\\",\\\"size\\\":3550,\\\"type\\\":\\\"application/pdf\\\",\\\"uploading\\\":false,\\\"uploaded\\\":true,\\\"error\\\":false,\\\"progress\\\":100,\\\"url\\\":\\\"https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/18/File/6H6VEPP8_Angular_14_Migration_Handover_Document08c11f.pdf\\\",\\\"fileId\\\":\\\"1d1613c932\\\"},{\\\"name\\\":\\\"Screenshot From 2025-02-02 19-24-10.png\\\",\\\"size\\\":190300,\\\"type\\\":\\\"image/png\\\",\\\"uploading\\\":false,\\\"uploaded\\\":true,\\\"error\\\":false,\\\"progress\\\":100,\\\"url\\\":\\\"https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/18/File/3MUIO3XM_Screenshot_From_2025-02-02_19-24-1095d86b.png\\\",\\\"fileId\\\":\\\"97283e0997\\\"},{\\\"name\\\":\\\"file-sample_100kB.doc\\\",\\\"size\\\":100352,\\\"type\\\":\\\"application/msword\\\",\\\"uploading\\\":false,\\\"uploaded\\\":true,\\\"error\\\":false,\\\"progress\\\":100,\\\"url\\\":\\\"https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/18/File/N2GKTN3W_file-sample_100kB.doc\\\",\\\"fileId\\\":\\\"036a70a580\\\"}]}\\\" to \\\"{\\\"primary_email_id\\\":\\\"proqsmartsupplier@mailinator.com\\\",\\\"noGst\\\":false,\\\"gstinNumber\\\":\\\"29AAGCV9503N1ZM\\\",\\\"company_name\\\":\\\"VendoSmart Technology Pvt Ltd\\\",\\\"registeredAddress\\\":{\\\"fullAddress\\\":\\\"Jbr Tech Park, Jbr Tech Park, KIADB Export Promotion Industrial Area, Whitefield, Bengaluru, Karnataka 560066, India\\\",\\\"placeId\\\":\\\"ChIJk9wNMAURrjsR8PGi9rYiAns\\\",\\\"streetNumber\\\":\\\"\\\",\\\"street\\\":\\\"\\\",\\\"city\\\":\\\"Bengaluru\\\",\\\"state\\\":\\\"Karnataka\\\",\\\"stateCode\\\":\\\"KA\\\",\\\"postalCode\\\":\\\"560066\\\",\\\"country\\\":\\\"India\\\",\\\"countryCode\\\":\\\"IN\\\",\\\"location\\\":{\\\"lat\\\":12.9782954,\\\"lng\\\":77.72758440000001}},\\\"country\\\":\\\"India\\\",\\\"state\\\":\\\"Karnataka\\\",\\\"city\\\":\\\"Bangalore\\\",\\\"primaryManufacturingProcess\\\":[\\\"cnc_machining\\\",\\\"injection_molding\\\"],\\\"primaryContactName\\\":\\\"Vishal Patil\\\",\\\"phoneNumber\\\":\\\"8273995825\\\",\\\"websiteURL\\\":\\\"http://localhost:4200/wefab/supplier/supplier-onboarding\\\",\\\"linkedinURL\\\":\\\"https://sprints.zoho.in/workspace/vendosmart#P13/itemdetails/I70/description\\\",\\\"companyDocuments\\\":[{\\\"name\\\":\\\"Angular_14_Migration_Handover_Document.pdf\\\",\\\"size\\\":3550,\\\"type\\\":\\\"application/pdf\\\",\\\"uploading\\\":false,\\\"uploaded\\\":true,\\\"error\\\":false,\\\"progress\\\":100,\\\"url\\\":\\\"https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/18/File/6H6VEPP8_Angular_14_Migration_Handover_Document08c11f.pdf\\\",\\\"fileId\\\":\\\"1d1613c932\\\"},{\\\"name\\\":\\\"Screenshot From 2025-02-02 19-24-10.png\\\",\\\"size\\\":190300,\\\"type\\\":\\\"image/png\\\",\\\"uploading\\\":false,\\\"uploaded\\\":true,\\\"error\\\":false,\\\"progress\\\":100,\\\"url\\\":\\\"https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/18/File/3MUIO3XM_Screenshot_From_2025-02-02_19-24-1095d86b.png\\\",\\\"fileId\\\":\\\"97283e0997\\\"},{\\\"name\\\":\\\"file-sample_100kB.doc\\\",\\\"size\\\":100352,\\\"type\\\":\\\"application/msword\\\",\\\"uploading\\\":false,\\\"uploaded\\\":true,\\\"error\\\":false,\\\"progress\\\":100,\\\"url\\\":\\\"https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/18/File/N2GKTN3W_file-sample_100kB.doc\\\",\\\"fileId\\\":\\\"036a70a580\\\"}],\\\"phone_verified\\\":true,\\\"registered_lat\\\":12.9782954,\\\"registered_lng\\\":77.72758440000001}\\\""
          ]
        }
      },
      {
        "name": 871,
        "user": "System",
        "creation": "2025-05-17 10:30:15.123456",
        "time_since": "10 days ago",
        "data": {
          "changed": [
            "Onboarding Status changed from \"Pending\" to \"Under Review\""
          ]
        }
      },
      {
        "name": 870,
        "user": "ProqSmart Supplier",
        "creation": "2025-05-17 09:15:22.987654",
        "time_since": "10 days ago",
        "data": {
          "changed": [
            "Profile created and submitted for review"
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