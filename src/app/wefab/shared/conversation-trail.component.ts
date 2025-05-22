import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from './common.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-conversation-trail',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './conversation-trail.component.html',
  styleUrls: ['./conversation-trail.component.scss']
})
export class ConversationTrailComponent implements OnInit {
  messages: any[] = [];
  supplierId: string = '';
  loading = false;
  currentUser: string = 'You';
  newMessage: string = '';
  attachedFile: File | null = null;
  previewImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.supplierId = params.get('supplierId') || '';
      if (this.supplierId) {
        this.fetchMessages();
      }
    });
  }

  fetchMessages() {
    this.loading = true;
    const url = `/api/method/proq_buyer.api.capex_request.capex_request_data.get_message_trail?doctype=wfb_supplier_onboarding_messenger&docname=${this.supplierId}`;
    this.commonService.getData(url).subscribe({
      next: (res: any) => {
        this.messages = (res?.data || []).map((msg: any) => ({
          sender: msg.user_name,
          email: msg.sender,
          company: msg.company_name,
          text: this.stripHtml(msg.comment),
          timestamp: new Date(msg.creation),
          attachments: msg.attachment || []
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  isImageFile(fileType: string): boolean {
    return ['jpg', 'jpeg', 'png', 'gif'].includes((fileType || '').toLowerCase());
  }

  isPdfFile(fileType: string): boolean {
    return (fileType || '').toLowerCase() === 'pdf';
  }

  onFileSelected(event: any) {
    this.attachedFile = event.target.files[0];
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        sender: this.currentUser,
        text: this.newMessage,
        timestamp: new Date()
      });
      this.newMessage = '';
      this.attachedFile = null;
    }
  }

  openImagePreview(url: string) {
    this.previewImageUrl = url;
  }

  closeImagePreview() {
    this.previewImageUrl = null;
  }
} 