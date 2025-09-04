import { Order } from 'app/server/models/Order';
import { ApiResponse, OrderWithProducts } from 'app/server/types/report';
import { authenticate } from 'app/shopify.server';

export async function loader({ request }: { request: Request }): Promise<Response> {
  try {
    // Authenticate and get the shop from session
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    
    if (!shop) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Shop not authenticated'
      }), { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await Order.countDocuments({ shop });

    // Fetch orders for the shop with pagination
    const orders = await Order.find({ shop })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format orders with line items - no need for product lookup
    const formattedOrders: OrderWithProducts[] = orders.map((order) => {
      return {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        // clientDetails: {
        //   id: order.clientDetails?.id || null,
        //   fullName: order.clientDetails?.fullName || null,
        //   email: order.clientDetails?.email || null
        // },
        lineItems: order.lineItems
      };
    });

    const response: ApiResponse = {
      success: true,
      data: {
        orders: formattedOrders,
        totalCount,
        page,
        limit
      }
    };

    return new Response(JSON.stringify(response));
  } catch (error) {
    console.error('Error fetching order details:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch order details'
    };

    return new Response(JSON.stringify(errorResponse), { status: 500 });
  }
}