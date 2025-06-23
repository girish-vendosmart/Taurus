# Supplier Order Module

This module provides order management functionality for suppliers in the WeFab system.

## Components

### SupplierOrderComponent
- **Location**: `supplier-order/supplier-order.component.ts`
- **Purpose**: Displays a list of orders for the supplier
- **Features**:
  - Dashboard cards showing order statistics
  - Common table component for order listing
  - Search, filter, and pagination capabilities
  - Navigation to order details

### SupplierOrderDetailsComponent
- **Location**: `supplier-order-details/supplier-order-details.component.ts`
- **Purpose**: Shows detailed information about a specific order
- **Features**:
  - Tabbed interface with overview, items, tracking, and documents
  - Order information display
  - Order items table
  - Delivery tracking functionality
  - Document management

## Interfaces

### OrderItem
- Contains order basic information like ID, name, dates, amount, and status
- Used for displaying order lists

### OrderDetails
- Comprehensive order information including financial and delivery details
- Used for order detail view

### OrderAttachment
- File attachment information for orders
- Supports various file types (PDF, images, etc.)

## API Endpoints

The module is designed to work with the following API endpoints:

- `GET /api/resource/Supplier Order` - Get orders list
- `GET /api/resource/Supplier Order/{id}` - Get order details
- `GET /api/resource/Supplier Order Item` - Get order items
- `GET /api/method/wefab.wefab.api.supplier.dashboard.order_dashboard.get_order_summary_stats` - Get order statistics

## Navigation

The module is integrated into the supplier routing system:
- `/supplier/order` - Order list
- `/supplier/order/details/:id` - Order details

## Styling

The components use SCSS with WeFab style guide variables for consistent theming and responsive design.

## Dependencies

- CommonModule (Angular)
- RouterModule (Angular)
- FormsModule (Angular)
- CommonTableComponent (Shared)
- CommonCardComponent (Shared)
- CommonService (Shared)
- ConversationTrailComponent (Shared)
- ConfigurableButtonComponent (Shared)

## Sample Data

The components include sample data for demonstration purposes when API endpoints are not available. 