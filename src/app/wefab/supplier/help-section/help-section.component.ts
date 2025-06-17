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

  goBack(): void {
    this.location.back();
  }
}
