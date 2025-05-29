import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from './../../common.service';
import { DialogModule } from 'primeng/dialog';
import { FileUploadService, FileUploadResult } from '../../file-upload.service';

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
  currentUser: any = sessionStorage.getItem('primary_email_id');
  newMessage: string = '';
  attachedFile: File | null = null;
  previewImageUrl: string | null = null;
  selectedFiles: File[] = [];
  attachments: { file_url: string }[] = [];
  uploading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.supplierId = params.get('supplierId') || 'SUP-000403';
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
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  isImageFile(fileType: string): boolean {
    return ['jpg', 'jpeg', 'png', 'gif'].includes((fileType || '').toLowerCase());
  }

  isPdfFile(fileType: string): boolean {
    return (fileType || '').toLowerCase() === 'pdf';
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
    this.uploading = true;
    const uploadObservables = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      uploadObservables.push(
        this.fileUploadService.uploadFile(file).toPromise()
      );
    }
    Promise.all(uploadObservables).then((results: (FileUploadResult | undefined)[]) => {
      results.forEach(result => {
        if (result && result.success && result.url) {
          this.attachments.push({ file_url: result.url });
        }
      });
      this.uploading = false;
    }).catch(() => {
      this.uploading = false;
    });
  }

  async sendMessage() {
    if (!this.newMessage.trim() || this.uploading) return;
    const payload = {
      document_id: this.supplierId,
      sender: this.currentUser, // You may want to use the actual email here
      comment: this.newMessage,
      attachment: this.attachments
    };
    try {
      await this.commonService.postData('/api/resource/wfb_supplier_onboarding_messenger', payload).toPromise();
      this.newMessage = '';
      this.attachments = [];
      // Optionally, refresh messages
      this.fetchMessages();
    } catch (e) {
      // Handle error (show toast, etc.)
    }
  }

  openImagePreview(url: string) {
    this.previewImageUrl = url;
  }

  closeImagePreview() {
    this.previewImageUrl = null;
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }
} 