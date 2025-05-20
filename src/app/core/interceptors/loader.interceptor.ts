import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { inject } from '@angular/core';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Show loader
    console.log('Class interceptor: Intercepting request', request.url);
    this.loaderService.show();
    
    // Pass the request through the interceptor chain and handle the response
    return next.handle(request).pipe(
      // Hide loader when the request completes (whether it succeeds or fails)
      finalize(() => {
        console.log('Class interceptor: Request completed', request.url);
        this.loaderService.hide();
      })
    );
  }
}

// Export a function for use with withInterceptors
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // Show loader
  console.log('Function interceptor: Intercepting request', req.url);
  loaderService.show();
  
  // Pass the request through the interceptor chain and handle the response
  return next(req).pipe(
    // Hide loader when the request completes (whether it succeeds or fails)
    finalize(() => {
      console.log('Function interceptor: Request completed', req.url);
      loaderService.hide();
    })
  );
}; 