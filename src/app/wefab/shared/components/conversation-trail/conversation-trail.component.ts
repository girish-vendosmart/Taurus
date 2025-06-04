import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from './../../common.service';
import { DialogModule } from 'primeng/dialog';
import { FileUploadService, FileUploadResult } from '../../file-upload.service';
import { EditorModule } from 'primeng/editor';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-conversation-trail',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, EditorModule, DateFormatPipe],
  templateUrl: './conversation-trail.component.html',
  styleUrls: ['./conversation-trail.component.scss']
})
export class ConversationTrailComponent implements OnInit {
  messages: any[] = [];
  supplierId: string = '';
  loading = false;
  currentUser: any = localStorage.getItem('primary_email_id');
  newMessage: string = '';
  attachedFile: File | null = null;
  previewImageUrl: string | null = null;
  selectedFiles: File[] = [];
  attachments: { file_url: string }[] = [];
  uploading: boolean = false;
  @Input() docType: string = ''
  @Input() docName: string = ''
  // Editor configuration
  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link']
    ]
  };
  hasValidMessageStatus: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit() {
    this.supplierId = localStorage.getItem('supplier_id') || '';
    this.fetchMessages();
    // this.route.paramMap.subscribe(params => {
    //   this.supplierId = params.get('supplierId') || 'SUP-000403';
    //   if (this.supplierId) {
    //     this.fetchMessages();
    //   }
    // });
  }

  fetchMessages() {
    this.loading = true;
    const url = `/api/method/wefab.wefab.api.common.engine.message.messaging.get_message_trail?doctype=${this.docType}&docname=${this.docName}`;
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
    if (!html) return '';
    
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Get text content and clean up common editor artifacts
    let textContent = div.textContent || div.innerText || '';
    
    // Remove common rich text editor artifacts like zero-width spaces, non-breaking spaces
    textContent = textContent.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width characters
    textContent = textContent.replace(/\u00A0/g, ' '); // Non-breaking spaces to regular spaces
    
    return textContent;
  }

  hasValidMessage(): boolean {
    if (!this.newMessage) return false;
    const textContent = this.stripHtml(this.newMessage);
    return textContent.trim().length > 0;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  isImageFile(fileType: string): boolean {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes((fileType || '').toLowerCase());
  }

  isImageFileByUrl(url: string): boolean {
    const ext = this.getFileExtension(url).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  }

  getFileName(url: string): string {
    if (!url) return '';
    return url.split('/').pop() || '';
  }

  getFileExtension(url: string): string {
    if (!url) return '';
    const fileName = this.getFileName(url);
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot + 1) : '';
  }

  isPdfFile(fileType: string): boolean {
    return (fileType || '').toLowerCase() === 'pdf';
  }

  getFileIconClass(fileType: string): string {
    const ext = (fileType || '').toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'pi pi-file-pdf';
      case 'doc':
      case 'docx':
        return 'pi pi-file-word';
      case 'xls':
      case 'xlsx':
        return 'pi pi-file-excel';
      case 'ppt':
      case 'pptx':
        return 'pi pi-file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return 'pi pi-image';
      case 'zip':
      case 'rar':
      case '7z':
        return 'pi pi-file-zip';
      default:
        return 'pi pi-file';
    }
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
      // Update validation status after adding attachments
      this.updateValidationStatus();
      // Clear the input
      event.target.value = '';
    }).catch(() => {
      this.uploading = false;
    });
  }

  async sendMessage() {
    if (!this.hasValidMessage() || this.uploading) return;
    
    const payload = {
      document_id: this.docName,
      sender: this.currentUser,
      comment: this.newMessage || '', // Allow empty message if there are attachments
      attachments: this.attachments
    };
    
    try {
      await this.commonService.postData(`/api/resource/${this.docType}`, payload).toPromise();
      this.newMessage = '';
      this.attachments = [];
      this.fetchMessages();
    } catch (e) {
      console.error('Error sending message:', e);
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
    // Update validation status after removing attachment
    this.updateValidationStatus();
  }

  getFileIcon(att: { file_url: string }): string {
    const ext = (att.file_url.split('.').pop() || '').toLowerCase();
    if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) return "pi pi-image";
    if (["pdf"].includes(ext)) return "pi pi-file-pdf";
    if (["doc","docx"].includes(ext)) return "pi pi-file-word";
    if (["xls","xlsx"].includes(ext)) return "pi pi-file-excel";
    if (["ppt","pptx"].includes(ext)) return "pi pi-file-powerpoint";
    if (["zip","rar","7z"].includes(ext)) return "pi pi-file-zip";
    return "pi pi-file";
  }

  viewAttachment(url: string) {
    window.open(url, '_blank');
  }

  downloadAttachment(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add method to handle editor text change
  onEditorTextChange(event: any): void {
    // This can help debug what's happening with the editor content
    console.log('Editor content:', this.newMessage);
    console.log('Has valid message:', this.hasValidMessage());
    
    this.newMessage = event.textValue;
    
    // Check if we have valid content (either text or attachments)
    const hasText = this.newMessage && this.newMessage.trim().length > 0;
    const hasAttachments = this.attachments && this.attachments.length > 0;
    
    // Set to false when button should be DISABLED (no content), true when button should be ENABLED
    this.hasValidMessageStatus = hasText || hasAttachments;
  }

  // Add method to update validation status
  updateValidationStatus(): void {
    const hasText = this.newMessage && this.newMessage.trim().length > 0;
    const hasAttachments = this.attachments && this.attachments.length > 0;
    this.hasValidMessageStatus = hasText || hasAttachments;
  }
} 