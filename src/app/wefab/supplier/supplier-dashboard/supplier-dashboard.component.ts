import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  NgApexchartsModule, 
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexYAxis,
  ApexGrid,
  ApexLegend,
  ApexMarkers
} from 'ng-apexcharts';
import { CommonService } from '../../shared/common.service';
import { Router } from '@angular/router';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  markers: ApexMarkers;
  colors: string[];
};

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  description: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    period: string;
  };
}

interface RecentQuotation {
  name: string;
  quotation_id?: string;
  amount?: number;
  creation: string;
  modified: string;
  status: string;
  statusClass: string;
  supplier_id?: string;
  timeAgo: string;
  urgencyClass: string;
}

interface RecentRFQ {
  name: string;
  rfq_id: string;
  status: string;
  statusClass: string;
  creation: string;
  modified: string;
  supplier_id: string;
  supplier_company_name: string | null;
  timeAgo: string;
  urgencyClass: string;
}

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './supplier-dashboard.component.html',
  styleUrl: './supplier-dashboard.component.scss'
})
export class SupplierDashboardComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  
  supplierName: string = '';
  supplierId: string;
  
  constructor(private commonService: CommonService, private router: Router) {
    // Get supplier information from session storage
    this.supplierName = sessionStorage.getItem('supplier_name') || 'Supplier';

    this.supplierId = sessionStorage.getItem('supplier_id') || '';
    
    // Initialize chart options
    this.chartOptions = {
      series: [
        {
          name: "Quotes Submitted",
          data: [4, 6, 8, 10, 12, 14, 16],
          color: "#1A3A5F"
        },
        {
          name: "Quotes Awarded",
          data: [2, 3, 4, 5, 6, 7, 8],
          color: "#12856E"
        }
      ],
      chart: {
        height: 450,
        type: "line",
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 3
      },
      grid: {
        show: true,
        borderColor: '#e0e6ed',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        row: {
          colors: undefined,
          opacity: 0.5
        },
        column: {
          colors: undefined,
          opacity: 0.5
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      markers: {
        size: 6,
        strokeWidth: 2,
        fillOpacity: 1,
        strokeOpacity: 1,
        hover: {
          size: 8
        }
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        labels: {
          style: {
            colors: '#545A64',
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        min: 0,
        max: 18,
        tickAmount: 6,
        labels: {
          style: {
            colors: '#545A64',
            fontSize: '12px'
          }
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px'
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '14px',
        fontWeight: 500,
        labels: {
          colors: '#1A1D21'
        }
      },
      colors: ["#1A3A5F", "#12856E"]
    };
  }

  ngOnInit(): void {
    this.getRecentRFQs()
    this.getRecentQuotations()
  }

  getRecentQuotations() {
    let endPoint = `/api/resource/Supplier Quotation?fields=["*"]&filters=[["supplier_id", "=", "${this.supplierId}"]]`
    this.commonService.getWefabData(endPoint).subscribe((res: any) => {
      
      console.log('Recent Quotations:', res);
      
      if (res && res.data && Array.isArray(res.data)) {
        // Sort by creation date (most recent first) and take the first 5
        const sortedQuotations = res.data
          .sort((a: any, b: any) => new Date(b.creation).getTime() - new Date(a.creation).getTime())
          .slice(0, 5);

        // Map the API response to our RecentQuotation interface
        this.recentQuotations = sortedQuotations.map((quotation: any) => {
          const creationDate = new Date(quotation.creation);
          const now = new Date();
          const timeDiff = now.getTime() - creationDate.getTime();
          
          return {
            name: quotation.name || quotation.quotation_id || `Quotation ${quotation.idx || ''}`,
            quotation_id: quotation.quotation_id,
            amount: quotation.total_amount || quotation.grand_total || 0,
            creation: quotation.creation,
            modified: quotation.modified,
            status: quotation.status || quotation.workflow_state || 'Draft',
            statusClass: this.getQuotationStatusClass(quotation.status || quotation.workflow_state),
            supplier_id: quotation.supplier_id,
            timeAgo: this.getTimeAgo(timeDiff),
            urgencyClass: this.getUrgencyClass(quotation.status || quotation.workflow_state, timeDiff)
          };
        });
      }
    }, (error) => {
      console.error('Error fetching Quotations:', error);
    });
  }

  private getQuotationStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return 'status-draft';
      case 'SUBMITTED':
        return 'status-awarded';
      case 'PENDING':
        return 'status-pending';
      case 'UNDER REVIEW':
      case 'UNDER_REVIEW':
        return 'status-review';
      case 'APPROVED':
      case 'AWARDED':
        return 'status-awarded';
      case 'REJECTED':
      case 'DECLINED':
        return 'status-rejected';
      case 'EXPIRED':
        return 'status-closed';
      default:
        return 'status-draft';
    }
  }

  getRecentRFQs() {
    let endPoint = `/api/resource/Supplier Request for Quotation?fields=["*"]&filters=[["supplier_id", "=", "${this.supplierId}"],["status", "not in", ["Draft"]]]`
    this.commonService.getWefabData(endPoint).subscribe((res: any) => {
      console.log('Recent RFQs:', res);
      
      if (res && res.data && Array.isArray(res.data)) {
        // Sort by creation date (most recent first) and take the first 5
        const sortedRFQs = res.data
          .sort((a: any, b: any) => new Date(b.creation).getTime() - new Date(a.creation).getTime())
          .slice(0, 5);

        // Map the API response to our RecentRFQ interface
        this.recentRFQs = sortedRFQs.map((rfq: any) => {
          const creationDate = new Date(rfq.creation);
          const now = new Date();
          const timeDiff = now.getTime() - creationDate.getTime();
          
          return {
            name: rfq.rfq_name,
            rfq_id: rfq.rfq_id,
            status: rfq.status || 'Draft',
            statusClass: this.getStatusClass(rfq.status),
            creation: rfq.creation,
            modified: rfq.modified,
            supplier_id: rfq.supplier_id,
            supplier_company_name: rfq.supplier_company_name,
            timeAgo: this.getTimeAgo(timeDiff),
            urgencyClass: this.getUrgencyClass(rfq.status, timeDiff)
          };
        });
      }
    }, (error) => {
      console.error('Error fetching RFQs:', error);
    });
  }

  private getStatusClass(status: string): string {
    console.log('Dashboard Status:', status);
    switch (status?.toUpperCase()) {
      case 'DRAFT':
        return 'status-draft';
      case 'OPENED':
        return 'status-open';
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'CLOSED':
        return 'status-closed';
      case 'AWARDED':
        return 'status-awarded';
      case 'REJECTED':
        return 'status-rejected';
      case 'PENDING':
        return 'status-pending';
      case 'UNDER REVIEW':
      case 'UNDER_REVIEW':
        return 'status-review';
      case 'CANCELLED':
        return 'status-rejected';
      case 'QUOTED':
        return 'status-awarded';
      case 'NOT OPENED':
        return 'status-open';
      default:
        return 'status-draft';
    }
  }

  private getTimeAgo(timeDiff: number): string {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor(timeDiff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  private getUrgencyClass(status: string, timeDiff: number): string {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (status?.toLowerCase() === 'closed' || status?.toLowerCase() === 'awarded') {
      return 'completed';
    } else if (days > 7) {
      return 'normal';
    } else if (days > 3) {
      return 'urgent';
    } else {
      return 'critical';
    }
  }

  dashboardCards: DashboardCard[] = [
    {
      title: 'Open RFQs',
      value: '12',
      icon: 'pi pi-file-o',
      color: 'info',
      description: 'Awaiting your quotation',
      trend: {
        value: '+2',
        direction: 'up',
        period: 'from last week'
      }
    },
    {
      title: 'Submitted Quotes',
      value: '24',
      icon: 'pi pi-send',
      color: 'warning',
      description: 'Quotes under review',
      trend: {
        value: '+5',
        direction: 'up',
        period: 'from last week'
      }
    },
    {
      title: 'Awarded Quotes',
      value: '8',
      icon: 'pi pi-check-circle',
      color: 'success',
      description: 'Quotes accepted by WeFab',
      trend: {
        value: '+1',
        direction: 'up',
        period: 'from last week'
      }
    },
    {
      title: 'Rejected Quotes',
      value: '3',
      icon: 'pi pi-times-circle',
      color: 'danger',
      description: 'Quotes not accepted',
      trend: {
        value: '-2',
        direction: 'down',
        period: 'from last week'
      }
    }
  ];

  recentQuotations: RecentQuotation[] = [];

  recentRFQs: RecentRFQ[] = [];

  // Legacy activities for backward compatibility
  recentActivities = [
    {
      title: 'Profile Approved',
      description: 'Your supplier profile has been successfully approved',
      timestamp: new Date(),
      type: 'success'
    },
    {
      title: 'Onboarding Complete',
      description: 'All onboarding stages have been completed',
      timestamp: new Date(),
      type: 'info'
    }
  ];

  viewRFQ(rfq: any) {
    sessionStorage.setItem('supplier_rfq_id', rfq.supplier_id);
    // sessionStorage.setItem('supplier_rfq_name', rfq.name);
    this.router.navigate(['/wefab/supplier/rfq/details/', rfq.rfq_id]);
  }

  viewQuotation(quotationId: string) {
    this.router.navigate(['/wefab/supplier/quotation/details/', quotationId]);
  }
} 