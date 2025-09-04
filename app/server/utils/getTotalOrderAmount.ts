import { Order } from "../models/Order";

export async function getTotalOrderAmount(shopifyProductId: string) {
  const result = await Order.aggregate([
    // Match orders containing the product
    {
      $match: {
        "lineItems.productId": shopifyProductId
      }
    },
    // Flatten the lineItems array
    { $unwind: "$lineItems" },
    // Keep only the line items for the desired product
    {
      $match: {
        "lineItems.productId": shopifyProductId
      }
    },
    // Calculate total for each line item: price * quantity
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: {
            $multiply: [
              { $toDouble: "$lineItems.price" }, // price is a string
              "$lineItems.quantity"
            ]
          }
        }
      }
    }
  ]);

  return result[0]?.totalAmount ?? 0;
}
