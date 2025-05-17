import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatUserListComponent } from './chat-user-list.component';
import { ChatWindowComponent } from './chat-window.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatUserListComponent, ChatWindowComponent],
  template: `
    <div class="wefab-chat-container">
      <!-- User List -->
      <div class="chat-user-list">
        <app-chat-user-list
          [selectedUserId]="selectedUserId"
          (userSelected)="onUserSelected($event)"></app-chat-user-list>
      </div>
      <!-- Chat Window -->
      <div class="chat-window">
        <app-chat-window [userId]="selectedUserId"></app-chat-window>
      </div>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  selectedUserId: number = 1;

  onUserSelected(id: number) {
    this.selectedUserId = id;
  }
} 