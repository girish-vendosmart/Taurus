import { Pipe, PipeTransform } from '@angular/core';
import { CustomerAddress } from '../../wefab/customer/rfq/create-rfq/create-rfq.component';

@Pipe({
  name: 'formatAddress',
  standalone: true
})
export class FormatAddressPipe implements PipeTransform {
  transform(address: CustomerAddress | undefined): string {
    if (!address) return 'No address selected';
    
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(part => part); // Remove empty/undefined parts
    
    return parts.join(', ');
  }
} 