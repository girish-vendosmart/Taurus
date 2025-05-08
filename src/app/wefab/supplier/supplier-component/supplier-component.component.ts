import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-supplier-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './supplier-component.component.html',
  styleUrl: './supplier-component.component.scss'
})
export class SupplierComponentComponent {

}
