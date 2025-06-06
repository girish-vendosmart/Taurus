import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-card.component.html',
  styleUrl: './common-card.component.scss'
})
export class CommonCardComponent {

  @Input() cards: any[] = [
    {
      title: 'Total Quotations',
      value: '0',
      icon: 'pi pi-file-o',
      color: 'info',
      description: 'All submitted quotations',
    },
    {
      title: 'Submitted Quotations',
      value: '0',
      icon: 'pi pi-check-circle',
      color: 'success',
      description: 'Successfully awarded quotations',
    },
    {
      title: 'Draft Quotations',
      value: '0',
      icon: 'pi pi-times-circle',
      color: 'warning',
      description: 'Pending or rejected quotations',
    }
  ];

}
