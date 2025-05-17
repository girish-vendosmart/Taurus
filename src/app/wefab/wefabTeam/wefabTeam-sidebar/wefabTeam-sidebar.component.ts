import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-wefabTeam-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>WefabTeam Portal</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/wefab/wefabTeam/supplier-finder" routerLinkActive="active">
              <i class="bi bi-people"></i>
              Supplier Finder
            </a>
          </li>
          <li>
            <a routerLink="/wefab/wefabTeam/manage-suppliers" routerLinkActive="active">
              <i class="bi bi-people"></i>
              Manage Suppliers
            </a>
          </li>
          <li>
            <a routerLink="/wefab/wefabTeam/chat" routerLinkActive="active">
              <i class="bi bi-chat-dots"></i>
              Messages
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background-color: #2c3e50;
      color: white;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .sidebar-nav {
      padding: 20px 0;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav li {
      margin-bottom: 5px;
    }

    .sidebar-nav a {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: white;
      text-decoration: none;
      transition: background-color 0.3s;
    }

    .sidebar-nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav a.active {
      background-color: #3498db;
    }

    .sidebar-nav i {
      margin-right: 10px;
      width: 20px;
      text-align: center;
      font-size: 1.2rem;
    }
  `]
})
export class WefabTeamSidebarComponent {
  constructor() {}
} 