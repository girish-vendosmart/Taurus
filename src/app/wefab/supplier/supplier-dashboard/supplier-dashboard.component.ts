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

interface RecentRFQ {
  title: string;
  rfqNumber: string;
  status: 'Open' | 'In Progress' | 'Closed';
  statusClass: string;
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
  
  constructor() {
    // Get supplier information from session storage
    this.supplierName = sessionStorage.getItem('supplier_name') || 'Supplier';
    
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

  recentRFQs: RecentRFQ[] = [
    {
      title: 'CNC Machined Aluminum Brackets',
      rfqNumber: 'RFQ-2023-001',
      status: 'Open',
      statusClass: 'status-open'
    },
    {
      title: 'Sheet Metal Enclosure',
      rfqNumber: 'RFQ-2023-002',
      status: 'Open',
      statusClass: 'status-open'
    },
    {
      title: '3D Printed Prototype Parts',
      rfqNumber: 'RFQ-2023-003',
      status: 'In Progress',
      statusClass: 'status-progress'
    },
    {
      title: 'Injection Molded Housing',
      rfqNumber: 'RFQ-2023-004',
      status: 'Closed',
      statusClass: 'status-closed'
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
} 