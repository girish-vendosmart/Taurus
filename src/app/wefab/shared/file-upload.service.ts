import { Injectable } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, from, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { CommonService } from './common.service';

export interface FileUploadResult {
  file: File;
  url: string;
  progress: number;
  error?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private commonService: CommonService) {}

  /**
   * Upload a single file and return the URL from the response
   * @param file The file to upload
   */
  uploadFile(file: File): Observable<FileUploadResult> {
    const result: FileUploadResult = {
      file: file,
      url: '',
      progress: 0,
      success: false
    };

    return this.commonService.uploadFile(file).pipe(
      tap(event => {
        // Track upload progress
        if (event.type === HttpEventType.UploadProgress && event.total) {
          result.progress = Math.round(100 * event.loaded / event.total);
        }
      }),
      switchMap(event => {
        // Process the response when complete
        if (event.type === HttpEventType.Response) {
          const response = event.body as any;
          
          // Extract the file URL from the response
          // Adjust the path according to your API's response structure
          if (response && response.message && response.message.file_url) {
            result.url = response.message.file_url;
            result.success = true;
            return of(result);
          } else {
            result.error = 'Could not extract file URL from response';
            return of(result);
          }
        }
        return of(result);
      }),
      catchError(error => {
        result.error = error.message || 'Unknown error occurred during upload';
        console.error('File upload error:', error);
        return of(result);
      })
    );
  }

  /**
   * Upload multiple files and return an array of URLs
   * @param files Array of files to upload
   */
  uploadMultipleFiles(files: File[]): Observable<FileUploadResult[]> {
    if (!files || files.length === 0) {
      return of([]);
    }

    // Create an array of observables for each file upload
    const uploads = files.map(file => this.uploadFile(file));
    
    // Combine all upload observables
    return forkJoin(uploads);
  }

  /**
   * Upload files and append URLs to a JSON object
   * @param files Files to upload
   * @param jsonData The JSON data object to attach URLs to
   * @param fieldName The field name in the JSON object to store URLs
   */
  uploadFilesAndAttachToJson(
    files: File[], 
    jsonData: any, 
    fieldName: string = 'document_urls'
  ): Observable<any> {
    if (!files || files.length === 0) {
      return of(jsonData);
    }

    return this.uploadMultipleFiles(files).pipe(
      map(results => {
        // Filter for successful uploads and extract URLs
        const urls = results
          .filter(result => result.success)
          .map(result => result.url);
        
        // Create a new object with the file URLs attached
        const updatedData = { 
          ...jsonData,
          [fieldName]: files.length === 1 ? urls[0] : urls 
        };
        
        return updatedData;
      })
    );
  }
} 