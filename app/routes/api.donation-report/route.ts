import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Product } from "app/server/models/Product";
import { Order } from "app/server/models/Order";
import { authenticate } from "app/shopify.server";
import { env } from "env.server";


export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Authenticate the request
    const { admin, session } = await authenticate.admin(request);
    const shopDomain = session?.shop;
    console.log(shopDomain)
    if (!admin || !shopDomain) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Authentication required" }),
        { status: 401 }
      );
    }

    // Parse URL parameters for search functionality
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search')?.trim();

    // Build the base query
    let query: any = {
      shop: shopDomain,
      isDeleted: false,
      status: 'ACTIVE',
      isVariant: false 
    };

    // Add search functionality if search query is provided
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Fetch only active products from database
    const products = await Product.find(
      query,
      {
        title: 1,
        shopifyProductId: 1,
        variantId: 1,
        price: 1,
        _id: 0 // Exclude MongoDB _id from response
      }
    ).lean();

    // Transform the data if needed
    const formattedProducts = products.map(product => ({
      title: product.title,
      productId: product.shopifyProductId,
      variantId: product.variantId,
      price: product.price
    }));

    return new Response(JSON.stringify({
      success: true,
      count: formattedProducts.length,
      searchQuery: searchQuery || null,
      products: formattedProducts
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch products",
      details: env.NODE_ENV === 'development' ? String(error) : undefined
    }), { status: 500 });
  }
}


export async function action({ request }: ActionFunctionArgs) {
  try {
    // Authenticate the request
    const { admin, session } = await authenticate.admin(request);
    const shopDomain = session?.shop;

    if (!admin || !shopDomain) {
      return new Response(JSON.stringify(
        { error: "Unauthorized: Authentication required" }
      ), { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { productId, startDate, endDate } = body;

    // Validate required fields
    if (!productId || !startDate) {
      return new Response(JSON.stringify(
        {
          success: false,
          error: "Missing required fields: productId and startDate are required"
        }
      ), { status: 400 });
    }

    // Build date query
    const dateQuery: any = {};

    // Parse start date
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return new Response(JSON.stringify(
        {
          success: false,
          error: "Invalid startDate format. Use YYYY-MM-DD format"
        }
      ), { status: 400 });
    }

    dateQuery.$gte = start;

    // Parse end date if provided, otherwise use CURRENT DATE
    let end: Date;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return new Response(JSON.stringify(
          { error: "Invalid endDate format. Use YYYY-MM-DD format" }
        ), { status: 400 });
      }
    } else {
      // If no end date, use CURRENT DATE
      end = new Date();
    }
    // Set to end of day
    end.setHours(23, 59, 59, 999);
    dateQuery.$lte = end;

    // Build the query to find orders with matching product ID and date range
    const query = {
      shop: shopDomain,
      'lineItems.productId': productId,
      createdAt: dateQuery
    };

    // Fetch orders with the specified criteria
    const orders = await Order.find(query)
      .select({
        lineItems: 1,
        createdAt: 1,
        _id: 0
      })
      .lean();

    // Initialize month-wise data object (now tracking price instead of quantity)
    const monthlyData: Record<string, { month: string, totalPrice: number }> = {};
    
    // Process orders
    orders.forEach(order => {
      // Filter line items to only include the specified product
      const relevantLineItems = order.lineItems.filter(
        (item: any) => item.productId === productId
      );
      
      // Calculate total price for this order (price * quantity for each line item)
      const orderTotalPrice = relevantLineItems.reduce(
        (sum: number, item: any) => {
          const price = parseFloat(item.price) || 0;
          const quantity = item.quantity || 0;
          return sum + (price * quantity);
        }, 0
      );
      
      // Skip if no relevant items or total price is 0
      if (orderTotalPrice === 0) return;
      
      // Get month name and year
      const orderDate = new Date(order.createdAt);
      const monthYear = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = orderDate.toLocaleString('default', { month: 'long' });
      const monthKey = `${monthName} ${orderDate.getFullYear()}`;
      
      // Add or update the monthly data
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthKey,
          totalPrice: 0
        };
      }
      
      monthlyData[monthYear].totalPrice += orderTotalPrice;
    });

    // Fill in missing months with zero prices
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();
    
    // Generate all months in the date range
    for (let year = startYear; year <= endYear; year++) {
      // Determine start/end months for this year
      const firstMonth = (year === startYear) ? startMonth : 0;
      const lastMonth = (year === endYear) ? endMonth : 11;
      
      for (let month = firstMonth; month <= lastMonth; month++) {
        // Format as YYYY-MM
        const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthKey = `${monthNames[month]} ${year}`;
        
        // If this month doesn't exist in our data, add it with zero price
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthKey,
            totalPrice: 0
          };
        }
      }
    }

    // Convert to array and sort chronologically
    const monthlyBreakdown = Object.values(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(monthA) - months.indexOf(monthB);
    });

    // Return the monthly breakdown array
    return new Response(JSON.stringify({
      monthlyBreakdown
    }));

  } catch (error) {
    console.error("Error fetching order details:", error);
    return new Response(JSON.stringify(
      { error: "Failed to fetch order details" }
    ), { status: 500 });
  }
}