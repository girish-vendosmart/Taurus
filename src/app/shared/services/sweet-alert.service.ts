import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertInput, SweetAlertPosition, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  
  // WE-FAB brand colors from style guide
  private brandColors = {
    blueprintBlue: '#2f59eb',  // Primary brand color
    technicalWhite: '#F6F7F9', // Background color
    precisionBlack: '#1A1D21', // Text color
    machineGray: '#545A64',    // Secondary elements
    materialSilver: '#D1D5DB', // Borders, backgrounds
    safetyOrange: '#FF5722',   // CTAs, highlights, error states
    processGreen: '#12856E'    // Success states, progress
  };
  
  constructor() { 
    // Apply WE-FAB brand theme to SweetAlert globally
    this.applyBrandTheme();
  }
  
  /**
   * Apply WE-FAB brand theme to SweetAlert globally
   */
  private applyBrandTheme(): void {
    // Set global SweetAlert styling
    Swal.mixin({
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
        denyButton: 'swal2-deny'
      }
    });
    
    // Apply CSS variables for WE-FAB theming
    document.documentElement.style.setProperty('--swal2-font', '"Inter", sans-serif');
    
    // Colors
    document.documentElement.style.setProperty('--swal2-background', this.brandColors.technicalWhite);
    document.documentElement.style.setProperty('--swal2-color', this.brandColors.precisionBlack);
    
    // Button colors
    document.documentElement.style.setProperty('--swal2-confirm-button-background-color', this.brandColors.blueprintBlue);
    document.documentElement.style.setProperty('--swal2-cancel-button-background-color', this.brandColors.machineGray);
    document.documentElement.style.setProperty('--swal2-deny-button-background-color', this.brandColors.safetyOrange);
    
    // Status colors
    document.documentElement.style.setProperty('--swal2-success-color', this.brandColors.processGreen);
    document.documentElement.style.setProperty('--swal2-error-color', this.brandColors.safetyOrange);
    document.documentElement.style.setProperty('--swal2-warning-color', this.brandColors.safetyOrange);
    document.documentElement.style.setProperty('--swal2-info-color', this.brandColors.blueprintBlue);
    document.documentElement.style.setProperty('--swal2-question-color', this.brandColors.blueprintBlue);
    
    // Add custom CSS for more specific styling
    const style = document.createElement('style');
    style.innerHTML = `
      .swal2-popup {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(26, 29, 33, 0.1);
      }
      .swal2-title {
        font-weight: 600 !important;
        font-size: 15px !important;
      }
      .swal2-html-container {
        font-weight: 600 !important;
        font-size: 15px !important;
        line-height: 1.5 !important;
      }
      .swal2-confirm, .swal2-cancel, .swal2-deny {
        font-weight: 500 !important;
        font-size: 15px !important;
        padding: 10px 24px !important;
        border-radius: 4px !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Show a toast notification
   * @param title The title of the toast
   * @param icon The icon type ('success', 'error', 'warning', 'info', 'question')
   * @param position The position of the toast
   * @param timer Duration in milliseconds
   */
  toast(
    title: string, 
    icon: SweetAlertIcon = 'success', 
    position: SweetAlertPosition = 'top-end', 
    timer: number = 2000
  ): void {
    const Toast = Swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    
    Toast.fire({
      icon: icon,
      title: title
    });
  }
  
  /**
   * Show a success toast notification
   * @param message The message to display
   * @param position The position of the toast
   * @param timer Duration in milliseconds
   */
  success(message: string, position: SweetAlertPosition = 'top-end', timer: number = 2000): void {
    this.toast(message, 'success', position, timer);
  }
  
  /**
   * Show an error toast notification
   * @param message The message to display
   * @param position The position of the toast
   * @param timer Duration in milliseconds
   */
  error(message: string, position: SweetAlertPosition = 'top-end', timer: number = 2000): void {
    this.toast(message, 'error', 'top-end', timer);
  }
  
  /**
   * Show a warning toast notification
   * @param message The message to display
   * @param position The position of the toast
   * @param timer Duration in milliseconds
   */
  warning(message: string, position: SweetAlertPosition = 'top-end', timer: number = 5000): void {
    this.toast(message, 'warning', position, timer);
  }
  
  /**
   * Show an info toast notification
   * @param message The message to display
   * @param position The position of the toast
   * @param timer Duration in milliseconds
   */
  info(message: string, position: SweetAlertPosition = 'top-end', timer: number = 2000): void {
    this.toast(message, 'info', position, timer);
  }
  
  /**
   * Show a confirmation dialog
   * @param title The title of the dialog
   * @param text The text of the dialog
   * @param icon The icon type
   * @param confirmButtonText The text for the confirm button
   * @param cancelButtonText The text for the cancel button
   * @returns Promise that resolves with the result
   */
  confirm(
    title: string, 
    text: string, 
    icon: SweetAlertIcon = 'warning',
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'No'
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: this.brandColors.blueprintBlue,
      cancelButtonColor: this.brandColors.machineGray,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText
    });
  }
  
  /**
   * Show a delete confirmation dialog
   * @param title The title of the dialog
   * @param text The text of the dialog
   * @returns Promise that resolves with the result
   */
  confirmDelete(
    title: string = 'Are you sure?', 
    text: string = 'You won\'t be able to revert this!'
  ): Promise<SweetAlertResult<any>> {
    return this.confirm(
      title,
      text,
      'warning',
      'Yes, delete it!',
      'Cancel'
    );
  }
  
  /**
   * Show an input dialog
   * @param title The title of the dialog
   * @param input The input type ('text', 'email', etc.)
   * @param placeholder The placeholder text
   * @returns Promise that resolves with the result
   */
  input(
    title: string, 
    input: string = 'text',
    placeholder: string = '',
    inputLabel: string = '',
    inputValue: string = ''
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      input: input as SweetAlertInput,
      inputPlaceholder: placeholder,
      inputLabel: inputLabel,
      inputValue: inputValue,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: this.brandColors.blueprintBlue,
      cancelButtonColor: this.brandColors.machineGray,
      inputValidator: (value:any) => {
        if (!value) {
          return 'You need to write something!';
        }
        return null;
      }
    });
  }
  
  /**
   * Show a loading dialog
   * @param title The title of the dialog
   * @returns The Swal instance
   */
  loading(title: string = 'Loading...'): typeof Swal {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    return Swal;
  }
  
  /**
   * Close the currently open dialog
   */
  close(): void {
    Swal.close();
  }
  
  /**
   * Show a custom modal
   * @param options The options for the modal
   * @returns Promise that resolves with the result
   */
  custom(options: any): Promise<SweetAlertResult<any>> {
    return Swal.fire(options);
  }
  
  /**
   * Show a modal with HTML content
   * @param title The title of the modal
   * @param html The HTML content
   * @param icon The icon type
   * @returns Promise that resolves with the result
   */
  htmlContent(
    title: string, 
    html: string, 
    icon: SweetAlertIcon = 'info'
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      html: html,
      icon: icon
    });
  }
  
  /**
   * Show a modal with 'operation success' message
   * @param title The title of the modal
   * @param text The text of the modal
   * @returns Promise that resolves with the result
   */
  operationSuccess(
    title: string = 'Completed!', 
    text: string = 'The operation was completed successfully.'
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: this.brandColors.blueprintBlue
    });
  }
  
  /**
   * Show a modal with 'operation failed' message
   * @param title The title of the modal
   * @param text The text of the modal
   * @returns Promise that resolves with the result
   */
  operationFailed(
    title: string = 'Failed!', 
    text: string = 'The operation failed to complete.'
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: this.brandColors.blueprintBlue
    });
  }
  
  /**
   * Show a modal with auto-close timer
   * @param title The title of the modal
   * @param text The text of the modal
   * @param icon The icon type
   * @param timer Duration in milliseconds
   * @returns Promise that resolves with the result
   */
  autoClose(
    title: string, 
    text: string, 
    icon: SweetAlertIcon = 'success', 
    timer: number = 2000
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      timer: timer,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }
}