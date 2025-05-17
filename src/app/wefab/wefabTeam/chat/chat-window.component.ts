import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chat-header">
      <div class="chat-user-info">
        <img src="assets/avatars/matriks.png" class="avatar" alt="Matriks Studio">
        <div>
          <div class="user-name">Matriks Studio</div>
          <div class="user-status">Online</div>
        </div>
      </div>
    </div>
    <div class="chat-messages">
      <ng-container *ngIf="messages; else loading">
        <div *ngFor="let msg of messages" [ngClass]="{'message-bubble': true, 'sent': msg.sender === 'Matriks Studio', 'received': msg.sender !== 'Matriks Studio'}">
          <ng-container [ngSwitch]="msg.type">
            <ng-container *ngSwitchCase="'text'">
              <span>{{ msg.content }}</span>
            </ng-container>
            <ng-container *ngSwitchCase="'image'">
              <span>{{ msg.content.name }}</span>
              <img [src]="msg.content.url" class="message-image" [alt]="msg.content.name">
            </ng-container>
            <ng-container *ngSwitchCase="'file'">
              <div class="message-file">
                <i class="bi bi-file-earmark"></i>
                <span>{{ msg.content.name }}</span>
                <span class="file-size">{{ msg.content.size }}</span>
              </div>
            </ng-container>
          </ng-container>
        </div>
      </ng-container>
      <ng-template #loading>
        <div>Loading messages...</div>
      </ng-template>
    </div>
    <div class="chat-input-bar">
      <label class="attach-btn">
        <i class="bi bi-paperclip"></i>
        <input type="file" hidden />
      </label>
      <input type="text" placeholder="Type a message..." class="chat-input" />
      <button class="send-btn"><i class="bi bi-send"></i></button>
    </div>
  `,
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnChanges {
  @Input() userId!: number;
  messages: any[] | null = null;

  constructor(private chatService: ChatService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && this.userId) {
      this.messages = null;
      this.chatService.getMessages(this.userId).subscribe(msgs => {
        this.messages = msgs;
      });
    }
  }
} 