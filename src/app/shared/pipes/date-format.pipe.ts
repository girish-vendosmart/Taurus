import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  
  transform(value: string | Date | null | undefined, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {
    if (!value) return '';
    
    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      
      if (isNaN(date.getTime())) {
        return value.toString();
      }
      
      switch (format) {
        case 'short':
          // Format: DD/MM/YYYY
          return this.formatShort(date);
        
        case 'medium':
          // Format: DD MMM YYYY, HH:MM AM/PM
          return this.formatMedium(date);
        
        case 'long':
          // Format: DD MMMM YYYY, HH:MM:SS AM/PM
          return this.formatLong(date);
        
        case 'full':
          // Format: Day, DD MMMM YYYY, HH:MM:SS AM/PM
          return this.formatFull(date);
        
        default:
          return this.formatMedium(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return value?.toString() || '';
    }
  }
  
  private formatShort(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  
  private formatMedium(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  }
  
  private formatLong(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  }
  
  private formatFull(date: Date): string {
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${dayName}, ${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  }
} 