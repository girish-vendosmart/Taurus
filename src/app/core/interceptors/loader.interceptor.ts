import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Show loader
    this.loaderService.show();
    
    // Pass the request through the interceptor chain and handle the response
    return next.handle(request).pipe(
      // Hide loader when the request completes (whether it succeeds or fails)
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }
} 