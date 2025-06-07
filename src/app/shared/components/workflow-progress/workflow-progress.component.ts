import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ConfigurableButtonComponent } from '../configurable-button/configurable-button.component';

@Component({
  selector: 'app-workflow-progress',
  standalone: true,
  imports: [CommonModule, NgClass, ConfigurableButtonComponent],
  templateUrl: './workflow-progress.component.html',
  styleUrls: ['./workflow-progress.component.scss']
})
export class WorkflowProgressComponent {
  @Input() steps: any[] = [];
  @Input() showActions: boolean = false;
  @Output() approve = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
} 