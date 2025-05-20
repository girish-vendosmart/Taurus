import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  private subscription = new Subscription();

  constructor(
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Loader component initialized');
  }

  ngOnInit(): void {
    console.log('Loader component OnInit');
    
    // Get initial state
    this.loading = false;
    
    this.subscription.add(
      this.loaderService.loading$.subscribe(
        (isLoading: boolean) => {
          console.log('Loader state changed:', isLoading);
          this.loading = isLoading;
          // Force change detection
          this.cdr.detectChanges();
        }
      )
    );
  }

  ngOnDestroy(): void {
    console.log('Loader component destroyed');
    this.subscription.unsubscribe();
  }
} 