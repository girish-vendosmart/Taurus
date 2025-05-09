import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.loaderService.loading$.subscribe(
        (isLoading: boolean) => {
          this.loading = isLoading;
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
} 