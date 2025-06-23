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
import { CommonService } from '../../../../shared/services/common.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';
import { ConfigurableButtonComponent } from '../../../../shared/components/configurable-button/configurable-button.component';

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
}

interface RecentQuotation {
  name: string;
  quotation_id?: string;
  amount?: number;
  currencyCode?: string;
  creation: string;
  modified: string;
  status: string;
  statusClass: string;
  supplier_id?: string;
  timeAgo: string;
  formattedDate: string;
  urgencyClass: string;
  quotation_name: string;
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
  formattedDate: string;
  urgencyClass: string;
}

interface ChangeRequest {
  requestId: string;
  orderName: string;
  orderNumber: string;
  status: string;
  dueDate: string;
  formattedDueDate: string;
  priority: string;
  description: string;
  requestType: string;
}

interface UpcomingDeadline {
  orderId: string;
  orderName: string;
  orderNumber: string;
  deadline: string;
  formattedDeadline: string;
  priority: string;
  daysRemaining: number;
  orderType: string;
  amount: number;
  currencyCode: string;
}

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule, ConfigurableButtonComponent],
  templateUrl: './supplier-dashboard.component.html',
  styleUrl: './supplier-dashboard.component.scss'
})
export class SupplierDashboardComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  
  supplierName: string = '';
  supplierId: string;
  supplierCompanyName: string;
  
  constructor(private commonService: CommonService, private router: Router, private sweetAlertService: SweetAlertService) {
    // Get supplier information from session storage
    this.supplierName = localStorage.getItem('supplier_name') || 'Supplier';

    this.supplierId = localStorage.getItem('supplier_id') || '';

    this.supplierCompanyName = localStorage.getItem('supplier_company_name') || '';
    
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
    this.getSupplierDashboardData();
    this.getRecentRFQs()
    this.getRecentQuotations()
  }

  getSupplierDashboardData() {
    let endPoint = `/api/method/wefab.wefab.api.supplier.dashboard.overall_dashboard.get_supplier_dashboard_counts?supplier_company_id=${this.supplierId}`
    this.commonService.getWefabData(endPoint).subscribe((res: any) => {
      this.dashboardCards[0].value = res.message.rfqs_open_to_bid;
      this.dashboardCards[1].value = res.message.sent_quotes;
      this.dashboardCards[2].value = res.message.awarded_quotes;
      this.dashboardCards[3].value = res.message.rejected_quotes;
    });
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
            quotation_name: quotation.quotation_name,
            amount: quotation.total_amount || quotation.grand_total || 0,
            creation: quotation.creation,
            currencyCode: quotation.currency_code || 'INR',
            modified: quotation.modified,
            status: quotation.status || quotation.workflow_state || 'Draft',
            statusClass: this.getQuotationStatusClass(quotation.status || quotation.workflow_state),
            supplier_id: quotation.supplier_id,
            timeAgo: this.getTimeAgo(timeDiff),
            formattedDate: this.getFormattedDate(creationDate),
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
            formattedDate: this.getFormattedDate(creationDate),
            urgencyClass: this.getUrgencyClass(rfq.status, timeDiff)
          };
        });

      }
    }, (error) => {
      console.error('Error fetching RFQs:', error);
    });
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

  private getFormattedDate(date: Date): string {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate}, ${formattedTime}`;
  }

  dashboardCards: DashboardCard[] = [
    {
      title: 'Open RFQs',
      value: '12',
      icon: 'pi pi-file-o',
      color: 'info',
    },
    {
      title: 'Submitted Quotes',
      value: '24',
      icon: 'pi pi-send',
      color: 'warning',
    },
    {
      title: 'Awarded Quotes',
      value: '3',
      icon: 'pi pi-check-circle',
      color: 'success',
    },
    {
      title: 'Rejected Quotes',
      value: '8',
      icon: 'pi pi-check-circle',
      color: 'success',
    },
  ];

  recentQuotations: RecentQuotation[] = [];

  recentRFQs: RecentRFQ[] = [];

  urgentChangeRequests: ChangeRequest[] = [
    {
      requestId: 'ORD-2024-001',
      orderName: 'Precision Metal Components Order',
      orderNumber: 'ORD-PMC-2024-445',
      status: 'Pending Review',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      formattedDueDate: this.getFormattedDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
      priority: 'High',
      description: 'Change in material specifications required',
      requestType: 'Material Change'
    },
    {
      requestId: 'ORD-2024-002',
      orderName: 'Industrial Bearing Assembly',
      orderNumber: 'ORD-IBA-2024-332',
      status: 'Immediate Action',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      formattedDueDate: this.getFormattedDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
      priority: 'Critical',
      description: 'Delivery schedule modification needed',
      requestType: 'Schedule Change'
    }
  ];

  upcomingDeadlines: UpcomingDeadline[] = [
    {
      orderId: 'ORD-2024-001',
      orderName: 'Automotive Parts Manufacturing',
      orderNumber: 'ORD-APM-2024-778',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      formattedDeadline: this.getFormattedDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
      priority: 'High',
      daysRemaining: 3,
      orderType: 'Manufacturing',
      amount: 145000,
      currencyCode: 'INR'
    },
    {
      orderId: 'ORD-2024-002',
      orderName: 'Electronic Component Supply',
      orderNumber: 'ORD-ECS-2024-556',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      formattedDeadline: this.getFormattedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      priority: 'Medium',
      daysRemaining: 7,
      orderType: 'Supply',
      amount: 89500,
      currencyCode: 'INR'
    },
    {
      orderId: 'ORD-2024-003',
      orderName: 'Custom Machinery Parts',
      orderNumber: 'ORD-CMP-2024-334',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      formattedDeadline: this.getFormattedDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
      priority: 'Medium',
      daysRemaining: 5,
      orderType: 'Custom Manufacturing',
      amount: 234000,
      currencyCode: 'INR'
    }
  ];

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
    if(rfq.status === "Cancelled" || rfq.status === "Paused" || rfq.status === "Deactivated") {
      this.sweetAlertService.warning('RFQ is unavailable. It may be paused or deactivated by the buyer.');
      return;
   } else if (rfq.status === "Not opened") {
    this.updateRFQStatus(rfq.rfq_id);
    return;
  } else {
    console.log('Dashboard RFQ:', rfq);
    localStorage.setItem('supplier_rfq_id', rfq.supplier_id);
    // localStorage.setItem('supplier_rfq_name', rfq.name);
    this.router.navigate(['/wefab/supplier/rfq/details/', rfq.rfq_id]);
   }
  }

  updateRFQStatus(rfqId: string) {
    let apiEndpoint = `/api/resource/Supplier Request for Quotation/${rfqId}-${this.supplierId}`;
    this.commonService.putWefabData(apiEndpoint, {
      status: 'Opened'
    }).subscribe((res: any) => {
      console.log('Update RFQ Status', res);
      this.router.navigate(['/wefab/supplier/rfq/details', rfqId]);
    });
  }

  viewQuotation(quotationId: string) {
    this.router.navigate(['/wefab/supplier/quotation/details/', quotationId]);
  }

  browseRFQsConfig = {
    label: 'Browse All RFQs',
    icon: 'pi pi-search',
    severity: 'primary',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  createQuotationConfig = {
    label: 'Create Quotation',
    icon: 'pi pi-plus',
    severity: 'primary',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  reviewAllRequestsConfig = {
    label: 'Review All Requests',
    icon: 'pi pi-eye',
    severity: 'secondary',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  viewTimelineConfig = {
    label: 'View Timeline',
    icon: 'pi pi-calendar',
    severity: 'secondary',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  navigateToRFQs(): void {
    this.router.navigate(['/wefab/supplier/rfq']);
  }

  navigateToQuotation(): void {
    this.router.navigate(['/wefab/supplier/quotation']);
  }

  navigateToChangeRequests(): void {
    // Navigate to change requests page (placeholder route)
    console.log('Navigate to change requests');
    this.router.navigate(['/wefab/supplier/orders']);
  }

  navigateToOrders(): void {
    // Navigate to orders page
    console.log('Navigate to orders');
    this.router.navigate(['/wefab/supplier/orders']);
  }

  viewChangeRequest(request: ChangeRequest): void {
    // Handle change request view
    console.log('View change request:', request);
    this.router.navigate(['/wefab/supplier/orders/details', request.orderNumber]);
  }

  viewDeadlineOrder(deadline: UpcomingDeadline): void {
    // Handle deadline order view
    console.log('View deadline order:', deadline);
    this.router.navigate(['/wefab/supplier/orders/details', deadline.orderNumber]);
  }

  viewOrderDetails(orderNumber: string): void {
    // Navigate to order details page
    console.log('Navigate to order details:', orderNumber);
    this.router.navigate(['/wefab/supplier/order/details', orderNumber]);
  }

  getPriorityClass(priority: string): string {
    if (!priority) return 'priority-default';
    
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    
    // Convert to lowercase and replace spaces with hyphens
    status = status.toLowerCase().replace(/\s+/g, '-');
    console.log('Table status', status);
    
    switch (status) {
      case 'high':
        return 'status-rejected';
      case 'medium':
        return 'status-review'
      case 'immediate-action':
        return 'status-rejected';
      case 'pending-review':
        return 'status-review';
      case 'not-opened':
        return 'status-draft';
      case 'published':
        return 'status-approved';
      case 'deactivated':
        return 'status-paused'; 
      case 'invited':
        return 'status-open';
      case 'not-started':
        return 'status-draft';
      case 'under-review':
        return 'status-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'draft':
        return 'status-draft';
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-progress';
      case 'closed':
        return 'status-closed';
      case 'awarded':
        return 'status-awarded';
      case 'quoted':
        return 'status-awarded';
      case 'opened':
        return 'status-open';
      case 'cancelled':
        return 'status-rejected';
      case 'deactivate':
        return 'status-deactivate';
      case 'paused':
        return 'status-paused';
      case 'submitted':
        return 'status-awarded';
      case 'pending':
        return 'status-pending';
      case 'review':
        return 'status-review';
      case 'not-started':
        return 'status-draft';
      default:
        return 'status-default';
    }
  }

} 