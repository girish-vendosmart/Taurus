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
    this.updateLoadingState();
  }

  // Hide loader
  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
      this.updateLoadingState();
    }
  }

  // Reset loader (force hide)
  reset(): void {
    this.loadingCount = 0;
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    this.loadingSubject.next(this.loadingCount > 0);
  }
} 