import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyerSidebarComponent } from '../buyer-sidebar/buyer-sidebar.component';

@Component({
  selector: 'app-buyer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, BuyerSidebarComponent],
  template: `
    <div class="buyer-layout">
      <app-buyer-sidebar></app-buyer-sidebar>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .buyer-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
    }

    .main-content {
      flex: 1;
      margin-left: 250px;
      background-color: #f5f6fa;
      min-height: 100vh;
    }
  `]
})
export class BuyerLayoutComponent {
  constructor() {}
} 