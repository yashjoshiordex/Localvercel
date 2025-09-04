import type { LoaderFunctionArgs} from "@remix-run/node";
// import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { getStoreWithPlan } from "app/server/controllers/store.controller";
import { CustomError } from "app/server/utils/custom-error";
import { Order } from "app/server/models/Order";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);
    const { shop } = session;
    console.log(shop);
    try {

        const { planDoc } = await getStoreWithPlan(shop);

        // Get shop currency information
        const shopQuery = `
            query {
                shop {
                    currencyCode
                     currencyFormats {
                        moneyFormat
                    }
                }
            }
        `;

        const shopResponse = await admin.graphql(shopQuery);
        const shopData = await shopResponse.json();
        const { currencyCode, currencyFormats } = shopData.data.shop;
        const { moneyFormat } = currencyFormats;
        // Get current year and month
        const now = new Date();
        // const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JS months are 0-based

        // Get monthly orders data for current month only
        // const monthlyOrders = await Order.aggregate([
        //     {
        //         $match: {
        //             shop,
        //             createdAt: {
        //                 $gte: new Date(currentYear, currentMonth - 1, 1),
        //                 $lt: new Date(currentYear, currentMonth, 1)
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: {
        //                 year: { $year: "$createdAt" },
        //                 month: { $month: "$createdAt" }
        //             },
        //             count: { $sum: 1 },
        //             orders: { $push: "$$ROOT" }
        //         }
        //     },
        //     { $sort: { "_id.year": -1, "_id.month": -1 } }
        // ]);

        // Get yearly orders with counts
        // const yearlyOrders = await Order.aggregate([
        //     {
        //         $match: {
        //             shop,
        //             createdAt: {
        //                 $gte: new Date(currentYear, 0, 1),
        //                 $lt: new Date(currentYear + 1, 0, 1),
        //             },
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: {
        //                 year: { $year: "$createdAt" },
        //             },
        //             count: { $sum: 1 },
        //             orders: { $push: "$$ROOT" },
        //         },
        //     },
        //     { $sort: { "_id.year": -1 } },
        // ]);

        // Get monthly donation totals with proper item counting
        const monthlyDonations = await Order.aggregate([
            {
                $match: {
                    shop,
                },
            },
            {
                $project: {
                    orderId: 1,
                    createdAt: 1,
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    lineItems: 1
                }
            },
            { $unwind: "$lineItems" },
            {
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month"
                    },
                    totalAmount: { 
                        $sum: { $multiply: [{ $toDouble: "$lineItems.price" }, "$lineItems.quantity"] }
                    },
                    totalQuantity: { $sum: "$lineItems.quantity" },
                    uniqueOrders: { $addToSet: "$orderId" }
                },
            },
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    totalQuantity: 1,
                    orderCount: { $size: "$uniqueOrders" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // Get overall donation total
        const overallDonation = await Order.aggregate([
            { $match: { shop } },
            { $unwind: "$lineItems" },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: { $multiply: [{ $toDouble: "$lineItems.price" }, "$lineItems.quantity"] }
                    },
                    totalQuantity: { $sum: "$lineItems.quantity" },
                    uniqueOrders: { $addToSet: "$orderId" }
                },
            },
            {
                $project: {
                    totalAmount: 1,
                    totalQuantity: 1,
                    orderCount: { $size: "$uniqueOrders" }
                }
            }
        ]);

        // Format monthly donations with all months included
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        // Initialize all months with zero values
        const formattedMonthlyDonations:any = {};
        monthNames.forEach((monthName, index) => {
            formattedMonthlyDonations[monthName] = {
                amount: 0,
                quantity: 0,
                orderCount: 0
            };
        });
        
        // Update months that have data
        monthlyDonations.forEach(item => {
            const monthName = monthNames[item._id.month - 1];
            formattedMonthlyDonations[monthName] = {
                amount: parseFloat(item.totalAmount.toFixed(2)),
                quantity: item.totalQuantity,
                orderCount: item.orderCount
            };
        });

        // Get current month name
        const currentMonthName = monthNames[currentMonth - 1];

        const dashboardData = {
            plan: planDoc,
            currency: moneyFormat?.split("{{amount}}")[0]?.trim(),
            // allOrdersCount: allOrders.length,
            // monthlyOrdersCount: monthlyOrders.reduce((sum, y) => sum + y.count, 0) || monthlyOrders.length,
            // yearlyOrdersCount: yearlyOrders.reduce((sum, y) => sum + y.count, 0),
            currentMonthDonation: formattedMonthlyDonations[currentMonthName],
            monthlyDonations: formattedMonthlyDonations,
            lifeTimeDonation: overallDonation.length > 0 ? {
                amount: parseFloat(overallDonation[0].totalAmount.toFixed(2)),
                quantity: overallDonation[0].totalQuantity,
                orderCount: overallDonation[0].orderCount
            } : { amount: 0, quantity: 0, orderCount: 0 }
        }

        return new Response(
            JSON.stringify({ ...dashboardData }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        const status: number = error instanceof CustomError ? error.statusCode : 500;
        const message: string = error instanceof CustomError ? error.message : "Unexpected error";

        console.error(error);
        throw new Response(message, { status });
    }
};
