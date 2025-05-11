import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WefabTeamSidebarComponent } from '../wefabTeam-sidebar/wefabTeam-sidebar.component';

@Component({
  selector: 'app-wefabTeam-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, WefabTeamSidebarComponent],
  template: `
    <div class="wefabTeam-layout">
      <app-wefabTeam-sidebar></app-wefabTeam-sidebar>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .wefabTeam-layout {
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
export class WefabTeamLayoutComponent {
  constructor() {}
} 