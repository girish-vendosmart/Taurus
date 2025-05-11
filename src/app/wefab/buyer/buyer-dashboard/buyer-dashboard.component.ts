import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-content">
      <h1>Buyer Dashboard</h1>
      <div class="welcome-section">
        <h2>Welcome to your Buyer Dashboard</h2>
        <p>Manage your purchases and track your orders here.</p>
      </div>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>Active Orders</h3>
          <p>View and manage your current orders</p>
        </div>
        <div class="dashboard-card">
          <h3>Order History</h3>
          <p>Access your past orders</p>
        </div>
        <div class="dashboard-card">
          <h3>Saved Items</h3>
          <p>View your saved products</p>
        </div>
        <div class="dashboard-card">
          <h3>Account Settings</h3>
          <p>Manage your account preferences</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      padding: 2rem;
    }

    .welcome-section {
      margin-bottom: 2rem;
      text-align: center;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .dashboard-card {
      background: #ffffff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease-in-out;

      &:hover {
        transform: translateY(-5px);
      }

      h3 {
        margin-bottom: 0.5rem;
        color: #333;
      }

      p {
        color: #666;
        margin: 0;
      }
    }
  `]
})
export class BuyerDashboardComponent {
  constructor() {}
} 