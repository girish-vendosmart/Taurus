import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

interface Contact {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-help-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-section.component.html',
  styleUrl: './help-section.component.scss'
})
export class HelpSectionComponent {
  contacts: Contact[] = [
    {
      name: 'Dev Dutt Sharma',
      email: 'devdutt@vendosmart.com',
      phone: '+91 8010060704'
    },
    {
      name: 'Dhananjay',
      email: 'purchase@vendosmart.com',
      phone: '+91 9527221531'
    }
  ];

  showCopyToast = false;
  showDialingOptions = false;
  selectedPhoneNumber = '';

  constructor(
    private location: Location,
    private router: Router
  ) {}

  contactAdmin(contact: Contact): void {
    // Open email client with pre-filled email
    const emailSubject = encodeURIComponent('Supplier Support Query');
    const emailBody = encodeURIComponent(`Dear ${contact.name},\n\nI need assistance with the following:\n\n`);
    const mailtoUrl = `mailto:${contact.email}?subject=${emailSubject}&body=${emailBody}`;
    
    window.open(mailtoUrl, '_blank');
  }

  // Helper method to get encoded email subject
  getEmailSubject(): string {
    return encodeURIComponent('Supplier Support Query');
  }

  // Helper method to get encoded email body
  getEmailBody(contactName: string): string {
    return encodeURIComponent(`Dear ${contactName},\n\nI need assistance with the following:\n\n`);
  }

  goBack(): void {
    this.location.back();
  }

  // Add this method to generate Gmail URL
  getGmailUrl(email: string, contactName: string): string {
    const subject = encodeURIComponent('Supplier Support Query');
    const body = encodeURIComponent(`Dear ${contactName},\n\nI need assistance with the following:\n\n`);
    return `https://mail.google.com/mail/?view=cm&to=${email}&su=${subject}&body=${body}`;
  }

  // Enhanced method to handle phone number click
  async handlePhoneClick(phoneNumber: string, event: Event): Promise<void> {
    event.preventDefault();
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, use tel: link directly
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // On desktop, try multiple approaches
      this.selectedPhoneNumber = phoneNumber;
      
      // First, try to open desktop dialing app
      const telOpened = await this.tryDesktopDialingApp(phoneNumber);
      
      if (!telOpened) {
        // If desktop app didn't work, show online options
        this.showDialingOptions = true;
        
        // Auto-hide options after 10 seconds if user doesn't interact
        setTimeout(() => {
          this.showDialingOptions = false;
        }, 10000);
      }
    }
  }

  // Try to open desktop dialing applications
  private async tryDesktopDialingApp(phoneNumber: string): Promise<boolean> {
    try {
      // Create a hidden link to test tel: protocol
      const link = document.createElement('a');
      link.href = `tel:${phoneNumber}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Try to click the tel: link
      link.click();
      document.body.removeChild(link);
      
      // Wait a bit to see if something opened
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // We can't reliably detect if it worked, so we'll assume it might have
      // and show a brief message, then proceed with online options
      return false; // Return false to show online options as backup
    } catch (error) {
      console.log('Tel protocol not supported or no app configured');
      return false;
    }
  }

  // Open Google Voice for calling
  openGoogleVoice(phoneNumber: string): void {
    const googleVoiceUrl = `https://voice.google.com/u/0/calls?a=nc,${encodeURIComponent(phoneNumber)}`;
    window.open(googleVoiceUrl, '_blank');
    this.showDialingOptions = false;
  }

  // Open Skype Web for calling
  openSkypeWeb(phoneNumber: string): void {
    const skypeUrl = `https://web.skype.com/call/${encodeURIComponent(phoneNumber)}`;
    window.open(skypeUrl, '_blank');
    this.showDialingOptions = false;
  }

  // Open WhatsApp Web for calling
  openWhatsAppWeb(phoneNumber: string): void {
    // Remove + and spaces for WhatsApp format
    const cleanNumber = phoneNumber.replace(/[+\s-]/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
    this.showDialingOptions = false;
  }

  // Copy phone number to clipboard
  async copyToClipboard(phoneNumber: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      this.showCopyToast = true;
      this.showDialingOptions = false;
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        this.showCopyToast = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
      // Fallback: select the text
      this.fallbackCopyTextToClipboard(phoneNumber);
    }
  }

  // Close dialing options
  closeDialingOptions(): void {
    this.showDialingOptions = false;
  }

  // Fallback method for older browsers
  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopyToast = true;
      this.showDialingOptions = false;
      setTimeout(() => {
        this.showCopyToast = false;
      }, 3000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  }
}
