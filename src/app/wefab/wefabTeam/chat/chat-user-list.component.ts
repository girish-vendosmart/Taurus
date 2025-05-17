import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  unread: number;
}

@Component({
  selector: 'app-chat-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-list-panel">
      <div class="user-list-header">
        <h3>Messages</h3>
        <input class="search-bar" placeholder="Search messages" [(ngModel)]="searchTerm" />
      </div>
      <div class="section-header">PINNED MESSAGES</div>
      <ul class="user-list">
        <li *ngFor="let user of filteredPinnedUsers"
            class="user-list-item"
            [class.selected]="user.id === selectedUserId"
            (click)="selectUser(user.id)">
          <img [src]="user.avatar" class="avatar" [alt]="user.name">
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-last-message">{{ user.lastMessage }}</div>
          </div>
          <span *ngIf="user.unread > 0" class="badge">{{ user.unread }}</span>
        </li>
      </ul>
      <div class="section-header">ALL MESSAGES</div>
      <ul class="user-list">
        <li *ngFor="let user of filteredAllUsers"
            class="user-list-item"
            [class.selected]="user.id === selectedUserId"
            (click)="selectUser(user.id)">
          <img [src]="user.avatar" class="avatar" [alt]="user.name">
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-last-message">{{ user.lastMessage }}</div>
          </div>
          <span *ngIf="user.unread > 0" class="badge">{{ user.unread }}</span>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./chat-user-list.component.scss']
})
export class ChatUserListComponent {
  @Input() selectedUserId: number | null = null;
  @Output() userSelected = new EventEmitter<number>();

  searchTerm: string = '';

  // For now, mock data
  pinnedUsers: ChatUser[] = [
    { id: 1, name: 'Matriks Studio', avatar: 'assets/avatars/matriks.png', lastMessage: 'Typing...', unread: 2 }
  ];
  allUsers: ChatUser[] = [
    { id: 2, name: 'Dimas Eza', avatar: 'assets/avatars/dimas.png', lastMessage: 'Redesign udah siap nih...', unread: 0 }
  ];

  get filteredPinnedUsers() {
    return this.pinnedUsers.filter(u => u.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
  get filteredAllUsers() {
    return this.allUsers.filter(u => u.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  selectUser(id: number) {
    this.userSelected.emit(id);
  }
} 