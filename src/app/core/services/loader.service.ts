import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;

  // Observable to subscribe to for loading state changes
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() { }

  // Show loader
  show(): void {
    this.loadingCount++;
    console.log('Loader show called. Count:', this.loadingCount);
    this.updateLoadingState();
  }

  // Hide loader
  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
      console.log('Loader hide called. Count:', this.loadingCount);
      this.updateLoadingState();
    }
  }

  // Reset loader (force hide)
  reset(): void {
    console.log('Loader reset called. Previous count:', this.loadingCount);
    this.loadingCount = 0;
    this.updateLoadingState();
  }

  // Method for testing - shows the loader for specified duration
  showForDuration(durationMs: number = 2000): void {
    this.show();
    setTimeout(() => {
      this.hide();
    }, durationMs);
  }

  private updateLoadingState(): void {
    const isLoading = this.loadingCount > 0;
    console.log('Updating loading state to:', isLoading);
    this.loadingSubject.next(isLoading);
  }
} 