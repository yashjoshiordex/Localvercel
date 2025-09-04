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
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build query with search functionality
    const matchQuery: any = { shop };
    
    // Add search functionality if search parameter exists
    if (search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i');
      matchQuery.$or = [
        { orderId: searchRegex },
        { orderNumber: searchRegex },
        { 'lineItems.productName': searchRegex }
      ];
    }

    // Get total count of line items across all matching orders
    const lineItemCountResult = await Order.aggregate([
      { $match: matchQuery },
      { $project: { lineItemCount: { $size: "$lineItems" } } },
      { $group: { _id: null, totalLineItems: { $sum: "$lineItemCount" } } }
    ]);
    
    const totalLineItemCount = lineItemCountResult.length > 0 ? lineItemCountResult[0].totalLineItems : 0;

    // Get paginated line items with their order information
    const paginatedLineItems = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: "$lineItems" },
      { $sort: { createdAt: -1, "lineItems.id": 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          orderNumber: { $first: "$orderNumber" },
          createdAt: { $first: "$createdAt" },
          lineItems: { $push: "$lineItems" },
          redirectUrl: { $first: "$redirectUrl"}
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Format the result
    const formattedOrders: OrderWithProducts[] = paginatedLineItems.map((order) => {
      return {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        lineItems: order.lineItems,
        redirectUrl: order.redirectUrl || null,
      };
    });

    // Calculate current page line item count
    const currentPageLineItemCount = formattedOrders.reduce(
      (total, order) => total + order.lineItems.length, 
      0
    );

    const response: ApiResponse = {
      success: true,
      data: {
        orders: formattedOrders,
        totalLineItemCount,
        currentPageLineItemCount,
        page,
        limit,
        totalPages: Math.ceil(totalLineItemCount / limit),
        search: search || undefined
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