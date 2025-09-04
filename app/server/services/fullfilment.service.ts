import { Order } from '../models/Order';
import { Product } from '../models/Product';
import StoreConfiguration from '../models/storeConfiguration';
import { logger } from '../utils/logger';
import { FULFILLMENT_CREATE_MUTATION, PRODUCT_VARIANT_CREATE_MUTATION } from '../mutations';
import Donation from '../models/Donation';
import { getStoreWithPlan } from '../controllers/store.controller';
import { createAppUsageCharge } from '../utils/createAppUsageCharge';
import { getSubscriptionLineItemId } from '../utils/subscriptionLineItem';
import { sendOrderConfirmationEmail } from './email.service';

function toShopifyGID(type: "Product" | "ProductVariant", id: number | string): string {
  return `gid://shopify/${type}/${id}`;
}

// async function isAutoFulfillEnabled(shop: string): Promise<boolean> {
//   const config = await StoreConfiguration.findOne({ shop });
//   if (!config) {
//     logger.info('StoreConfiguration not found', { shop });
//     return false;
//   }
//   return !!config.autoFulfillOrders;
// }

// function hasDonateMeProducts(orderData: any): boolean {
//   return orderData.line_items?.some((item: any) => item.vendor === 'DonateMe');
// }

async function checkAndCreateVariantIfMissing(
  shop: string,
  productInDb: any,
  variantGID: string,
  lineItem: any,
  admin: any
) {
  const variantInDb = await Product.findOne({ variantId: variantGID, shop });
  if (!variantInDb) {
    const variantCreateResponse = await admin.graphql({
      query: PRODUCT_VARIANT_CREATE_MUTATION,
      variables: {
        input: {
          productId: productInDb.shopifyProductId,
          sku: lineItem.sku || productInDb.sku || null,
          price: lineItem.price || productInDb.price || "0.00",
        },
      },
    });

    const variantCreateJson = await variantCreateResponse.json();
    const userErrors = variantCreateJson?.data?.productVariantCreate?.userErrors;

    if (userErrors?.length) {
      logger.error('Shopify variant creation failed', {
        errors: userErrors,
        shop,
        productId: productInDb.shopifyProductId,
        orderLineItemId: lineItem.id,
      });
      return null;
    }

    const createdVariant = variantCreateJson.data.productVariantCreate.productVariant;

    const newVariant = new Product({
      shopifyProductId: productInDb.shopifyProductId,
      title: productInDb.title,
      variantId: toShopifyGID("ProductVariant", createdVariant.id),
      sku: createdVariant.sku,
      description: productInDb.description,
      price: parseFloat(createdVariant.price),
      minimumDonationAmount: productInDb.minimumDonationAmount || 0,
      shop,
      isDeleted: false,
      isVariant: true,
    });

    await newVariant.save();
    logger.info('Created missing variant in Shopify and saved in DB', {
      shop,
      variantId: createdVariant.id,
      orderLineItemId: lineItem.id,
    });

    return newVariant;
  }

  return variantInDb;
}

export async function handleOrderFulfillment(shop: string, orderData: any, admin: any) {
  try {
    logger.info('Starting order fulfillment process', { shop, orderId: orderData.id });
    console.log("Starting order fulfillment process", orderData);
    // Get store config for vendor & autoFulfill setting
    const storeConfig = await StoreConfiguration.findOne({ shop });
    if (!storeConfig) {
      logger.info('StoreConfiguration not found', { shop });
      return false;
    }

    const vendorName = "donateme";
    const autoFulfill = !!storeConfig.autoFulfillOrders;

    // Filter line items for matching vendor
    const vendorLineItems = orderData.line_items.filter(
      (item: any) => item.vendor?.toLowerCase() === vendorName
    );

    if (!vendorLineItems.length) {
      logger.info(`Order does not have ${vendorName} products`, { shop, orderId: orderData.id });
      return false;
    }

    let fulfillmentStatus = 'unfulfilled';

    if (autoFulfill) {
      // Get fulfillment orders from Shopify
      const orderQuery = await admin.graphql(`
        query {
          order(id: "gid://shopify/Order/${orderData.id}") {
            id
            fulfillmentOrders(first: 10) {
              edges {
                node {
                  id
                  status
                  lineItems(first: 50) {
                    edges {
                      node {
                        id
                        totalQuantity
                        remainingQuantity
                        lineItem {
                          vendor
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `);

      const orderJson = await orderQuery.json();
      const fulfillmentOrders = orderJson?.data?.order?.fulfillmentOrders?.edges;

      if (!fulfillmentOrders?.length) {
        logger.error('No fulfillment orders found', { shop, orderId: orderData.id });
        return false;
      }

      const fulfillableOrder = fulfillmentOrders.find(
        (edge: any) => edge.node.status === 'OPEN' && edge.node.lineItems.edges.length > 0
      );

      if (!fulfillableOrder) {
        logger.error('No fulfillable orders found', { shop, orderId: orderData.id });
        return false;
      }

      const fulfillmentOrderId = fulfillableOrder.node.id;

      // Ensure variants exist in DB / Shopify
      for (const item of vendorLineItems) {
        const productGID: string = toShopifyGID("Product", item.product_id);
        const productInDb = await Product.findOne({ shopifyProductId: productGID, shop, isDeleted: false });
        if (!productInDb) {
          logger.error('Product not found in DB for vendor order item', {
            shop,
            productId: productGID,
            orderId: orderData.id,
          });
          continue;
        }

        const variantGID = toShopifyGID("ProductVariant", item.variant_id);
        await checkAndCreateVariantIfMissing(shop, productInDb, variantGID, item, admin);
      }

      // Filter fulfillment order line items for vendor
      const vendorFulfillmentItems = fulfillableOrder.node.lineItems.edges
        .filter(
          (edge: any) =>
            edge.node.remainingQuantity > 0 &&
            edge.node.lineItem.vendor?.toLowerCase() === vendorName
        )
        .map((edge: any) => ({
          id: edge.node.id,
          quantity: edge.node.remainingQuantity,
        }));

      if (!vendorFulfillmentItems.length) {
        logger.error(`No fulfillable ${vendorName} line items`, { shop, orderId: orderData.id });
        return false;
      }

      // Create fulfillment
      const fulfillmentResponse = await admin.graphql(FULFILLMENT_CREATE_MUTATION, {
        variables: {
          fulfillment: {
            lineItemsByFulfillmentOrder: [
              {
                fulfillmentOrderId,
                fulfillmentOrderLineItems: vendorFulfillmentItems,
              },
            ],
          },
        },
      });

      const responseJson = await fulfillmentResponse.json();
      const userErrors = responseJson?.data?.fulfillmentCreate?.userErrors;
      const fulfillment = responseJson?.data?.fulfillmentCreate?.fulfillment;

      if (userErrors?.length > 0) {
        logger.error('Fulfillment creation failed', {
          errors: userErrors,
          shop,
          orderId: orderData.id,
        });
        throw new Error(userErrors[0].message);
      }

      fulfillmentStatus = fulfillment?.status === 'SUCCESS' ? 'fulfilled' : 'unfulfilled';
      logger.info(`${vendorName} items auto-fulfilled successfully`, {
        shop,
        orderId: orderData.id,
        fulfillmentId: fulfillment?.id,
      });
    } else {
      logger.info(`Auto fulfill not enabled for store. Saving as unfulfilled.`, { shop });
    }

    // Prepare customer full name
    let fullName = null;
    if (orderData.customer) {
      const firstName = orderData.customer.first_name || '';
      const lastName = orderData.customer.last_name || '';
      if (firstName || lastName) {
        fullName = `${firstName} ${lastName}`.trim();
      }
    }

    // Save order to DB
    const order = new Order({
      shop,
      orderId: orderData.id,
      orderNumber: orderData.name,
      fulfillmentStatus,
      lineItems: vendorLineItems.map((item: any) => ({
        id: item.id,
        productId: toShopifyGID("Product", item.product_id),
        variantId: toShopifyGID("ProductVariant", item.variant_id),
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor,
        productName: item.title || null,
        variantName: item.name || null
      })),
      clientDetails: {
        id: orderData.customer?.id ? String(orderData.customer.id) : null,
        fullName: fullName,
        email: orderData.customer?.email || null,
      },
      redirectUrl: orderData?.order_status_url || null,
      CURRENCY_CODE: orderData.currency
    });
    await order.save();

    // Send email for vendor products
    await sendOrderConfirmationEmail(shop, orderData, orderData.customer);

    console.log("Order saved in DB", order);
    const donationTotal = vendorLineItems.reduce((sum: number, item: any) => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      return sum + itemTotal;
    }, 0);

    if (donationTotal > 0) {
      const donationDoc = await Donation.findOne({ shopDomain: shop });

      if (!donationDoc) {
        const msg = `❌ Donation document not found for store: ${shop}`;
        logger.error(msg, { shop });
        console.error(msg);
        return;
      }

      const { planDoc } = await getStoreWithPlan(shop);
      if (!planDoc) {
        const msg = `❌ Plan document not found for store: ${shop}`;
        logger.error(msg, { shop });
        console.error(msg);
        return;
      }

      const initLog = {
        shop:shop,
        donationTotal:donationTotal,
        existingDonation: donationDoc.totalDonation,
        plan: {
          threshold: planDoc.threshold,
          transactionFee: planDoc.transactionFee,
        },
      };
      logger.info('🔍 Retrieved plan and donation documents.', initLog);
      console.log('🔍 Retrieved plan and donation documents.', initLog);

      // Backup current total before update
      donationDoc.lastChargedDonationAmount = donationDoc.totalDonation;

      // Update donation record
      donationDoc.totalDonation += donationTotal;
      donationDoc.donations.push({
        orderId: orderData.id.toString(),
        amount: donationTotal,
        donatedAt: new Date(),
      });

      const threshold = planDoc.threshold;
      const percentFee = planDoc.transactionFee;
      const totalDonation = donationDoc.totalDonation;

      // Calculate overage
      let overage = 0;
      if (totalDonation > threshold) {
        const previousOverage = Math.max(
          donationDoc.lastChargedDonationAmount - threshold,
          0
        );
        overage = totalDonation - threshold - previousOverage;

        const overageLog = {
          totalDonation:totalDonation,
          previousOverage:previousOverage,
          overage:overage,
          percentFee:percentFee,
        };
        logger.info('⚠️ Donation exceeds threshold. Calculating overage fee.', overageLog);
        console.log('⚠️ Donation exceeds threshold. Calculating overage fee.', overageLog);

        if (overage > 0) {
          const fee = (overage * percentFee) / 100;

          try {
            const lineItemId = await getSubscriptionLineItemId(admin);

            await createAppUsageCharge({
              admin,
              amount: parseFloat(fee.toFixed(2)),
              description: `Usage charge for $${totalDonation.toFixed(2)} donations`,
              subscriptionLineItemId: lineItemId as string,
            });

            const chargeLog = {
              shop,
              chargedAmount: fee.toFixed(2),
              overage,
              lineItemId,
            };
            logger.info('✅ Usage charge created successfully.', chargeLog);
            console.log('✅ Usage charge created successfully.', chargeLog);

            await donationDoc.save();
            console.log('💾 Donation document saved after billing.');
          } catch (billingError: any) {
            logger.error('❌ Failed to create usage charge.', {
              shop,
              error: billingError.message,
            });
            console.error('❌ Failed to create usage charge:', billingError);
            return;
          }
        } else {
          logger.info('ℹ️ No new overage to charge. Skipping billing.');
          console.log('ℹ️ No new overage to charge. Skipping billing.');
          await donationDoc.save();
          console.log('💾 Donation document saved without billing.');
        }
      } else {
        logger.info('ℹ️ Donation total is below threshold. No usage fee applied.', {
          totalDonation,
          threshold,
        });
        console.log('ℹ️ Donation total is below threshold. No usage fee applied.', {
          totalDonation,
          threshold,
        });

        await donationDoc.save();
        console.log('💾 Donation document saved (below threshold).');
      }
    }

    // logger.info('DonateMe items auto-fulfilled successfully', {
    //   shop,
    //   orderId: orderData.id,
    //   fulfillmentId: responseJson?.data?.fulfillmentCreate?.fulfillment?.id,
    // });

    return true;
  } catch (error: any) {
    logger.error('Error in handleOrderFulfillment', {
      error: error.message,
      shop,
      orderId: orderData?.id,
    });
    throw error;
  }
}
