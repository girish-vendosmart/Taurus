import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './core/components/loader/loader.component';
import { LoaderService } from './core/services/loader.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'we-fab-application';
  
  constructor(
    private loaderService: LoaderService,
    private http: HttpClient
  ) {}
  
  testLoader(): void {
    console.log('Test loader button clicked');
    this.loaderService.showForDuration(3000);
  }
  
  testHttpRequest(): void {
    console.log('Test HTTP request button clicked');
    // This should trigger the loader via the interceptor
    this.http.get('https://jsonplaceholder.typicode.com/todos/1').subscribe({
      next: (data) => console.log('HTTP request succeeded', data),
      error: (err) => console.error('HTTP request failed', err)
    });
  }
}
