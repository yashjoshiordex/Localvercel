import { Order } from 'app/server/models/Order';
import { authenticate } from 'app/shopify.server';
import {AggregateResult,ClientCountResult,MonthlyAggregateResult,MonthData,ReportResponse} from 'app/server/types/report';

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

    // Get current year for filtering
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // Get overall total across all orders for this shop
    const allOrdersAggregate = await Order.aggregate<AggregateResult>([
      {
        $match: { shop }
      },
      {
        $unwind: '$lineItems'
      },
      {
        $group: {
          _id: '$orderId',
          orderTotal: { 
            $sum: { $multiply: [{ $toDouble: '$lineItems.price' }, '$lineItems.quantity'] } 
          },
          itemCount: { $sum: '$lineItems.quantity' }
        }
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: '$orderTotal' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$itemCount' }
        }
      }
    ]);

    // Get overall client statistics
    const overallClientStats = await Order.aggregate<ClientCountResult>([
      {
        $match: { 
          shop,
          'clientDetails.id': { $ne: null, $exists: true } // Only count orders with client ID
        }
      },
      {
        $group: {
          _id: null,
          totalClientCount: { $sum: 1 }, // Count all orders with clients
          uniqueClients: { $addToSet: '$clientDetails.id' } // Collect unique client IDs
        }
      },
      {
        $project: {
          _id: 1,
          totalClientCount: 1,
          uniqueClientCount: { $size: '$uniqueClients' } // Count the unique clients
        }
      }
    ]);

    // Get current year orders data for this shop
    const currentYearAggregate = await Order.aggregate<AggregateResult>([
      {
        $match: {
          shop,
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $unwind: '$lineItems'
      },
      {
        $group: {
          _id: '$orderId',
          orderTotal: { 
            $sum: { $multiply: [{ $toDouble: '$lineItems.price' }, '$lineItems.quantity'] } 
          },
          itemCount: { $sum: '$lineItems.quantity' }
        }
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: '$orderTotal' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$itemCount' }
        }
      }
    ]);

    // Get current year client statistics
    // const currentYearClientStats = await Order.aggregate<ClientCountResult>([
    //   {
    //     $match: { 
    //       shop,
    //       'clientDetails.id': { $ne: null, $exists: true },
    //       createdAt: { $gte: startOfYear, $lte: endOfYear }
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalClientCount: { $sum: 1 },
    //       uniqueClients: { $addToSet: '$clientDetails.id' }
    //     }
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       totalClientCount: 1,
    //       uniqueClientCount: { $size: '$uniqueClients' }
    //     }
    //   }
    // ]);

    // Get month-wise data for current year
    const monthlyAggregate = await Order.aggregate<MonthlyAggregateResult>([
      {
        $match: {
          shop,
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $unwind: '$lineItems'
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, orderId: '$orderId' },
          orderTotal: { 
            $sum: { $multiply: [{ $toDouble: '$lineItems.price' }, '$lineItems.quantity'] } 
          },
          itemCount: { $sum: '$lineItems.quantity' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          totalPrice: { $sum: '$orderTotal' },
          orderCount: { $sum: 1 },
          itemCount: { $sum: '$itemCount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Format monthly data with month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyData: MonthData[] = monthNames.map((name, index) => {
      const monthData = monthlyAggregate.find((item) => item._id === index + 1);
      const totalPrice = monthData ? monthData.totalPrice : 0;
      const orderCount = monthData ? monthData.orderCount : 0;
      const itemCount = monthData ? monthData.itemCount : 0;
      
      return {
        month: name,
        totalPrice,
        orderCount,
        itemCount,
        averagePerItem: itemCount > 0 ? totalPrice / itemCount : 0
      };
    });

    // Calculate overall stats
    const overallTotal = allOrdersAggregate[0]?.totalPrice || 0;
    const overallCount = allOrdersAggregate[0]?.orderCount || 0;
    const overallItemCount = allOrdersAggregate[0]?.itemCount || 0;
    const overallAverage = overallCount > 0 ? overallTotal / overallCount : 0;
    const overallAveragePerItem = overallItemCount > 0 ? overallTotal / overallItemCount : 0;
    const overallTotalClientCount = overallClientStats[0]?.totalClientCount || 0;
    const overallUniqueClientCount = overallClientStats[0]?.uniqueClientCount || 0;

    // Calculate current year stats
    const yearTotal = currentYearAggregate[0]?.totalPrice || 0;
    const yearCount = currentYearAggregate[0]?.orderCount || 0;
    const yearItemCount = currentYearAggregate[0]?.itemCount || 0;
    const yearAverage = yearCount > 0 ? yearTotal / yearCount : 0;
    const yearAveragePerItem = yearItemCount > 0 ? yearTotal / yearItemCount : 0;
    // const yearTotalClientCount = currentYearClientStats[0]?.totalClientCount || 0;
    // const yearUniqueClientCount = currentYearClientStats[0]?.uniqueClientCount || 0;

    const response: ReportResponse = {
      success: true,
      data: {
        overall: {
          totalPrice: overallTotal,
          // average: overallAverage,
          averageDonation: overallAveragePerItem,
          orderCount: overallCount,
          itemCount: overallItemCount,
          totalClientCount: overallTotalClientCount,
          uniqueClientCount: overallUniqueClientCount
        },
        currentYear: {
          totalPrice: yearTotal,
          average: yearAverage,
          averageDonation: yearAveragePerItem,
          orderCount: yearCount,
          itemCount: yearItemCount,
        //   totalClientCount: yearTotalClientCount,
        //   uniqueClientCount: yearUniqueClientCount
        },
        monthlyData
      }
    };

    return new Response(JSON.stringify(response));
  } catch (error) {
    console.error('Error generating report:', error);
    
    const errorResponse: ReportResponse = {
      success: false,
      error: 'Failed to generate report'
    };

    return new Response(JSON.stringify(errorResponse), { status: 500 });
  }
}
