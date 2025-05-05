import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: string;
  quantity: number;
}


@Component({
  selector: 'app-test-components',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './test-components.component.html',
  styleUrl: './test-components.component.scss'
})
export class TestComponentsComponent {

  products: Product[] = [];
  globalFilterValue: string = '';

  ngOnInit() {
    this.products = [
      {
        id: 1,
        name: 'Laptop',
        price: 1200,
        category: 'Electronics',
        status: 'In Stock',
        quantity: 25
      },
      {
        id: 2,
        name: 'Smartphone',
        price: 850,
        category: 'Electronics',
        status: 'Low Stock',
        quantity: 8
      },
      {
        id: 3,
        name: 'Desk Chair',
        price: 150,
        category: 'Furniture',
        status: 'In Stock',
        quantity: 42
      },
      {
        id: 4,
        name: 'Coffee Maker',
        price: 80,
        category: 'Kitchen',
        status: 'Out of Stock',
        quantity: 0
      },
      {
        id: 5,
        name: 'Headphones',
        price: 120,
        category: 'Electronics',
        status: 'In Stock',
        quantity: 30
      }
    ];
  }

  clear(table: any) {
    table.clear();
    this.globalFilterValue = '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock':
        return 'badge bg-success';
      case 'Low Stock':
        return 'badge bg-warning text-dark';
      case 'Out of Stock':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

}
