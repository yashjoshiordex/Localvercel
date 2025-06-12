import { Order } from '../models/Order';
import { Product } from '../models/Product';
import StoreConfiguration from '../models/storeConfiguration';
import { logger } from '../utils/logger';
import { FULFILLMENT_CREATE_MUTATION, PRODUCT_VARIANT_CREATE_MUTATION } from '../mutations';

function toShopifyGID(type: "Product" | "ProductVariant", id: number | string): string {
  return `gid://shopify/${type}/${id}`;
}

async function isAutoFulfillEnabled(shop: string): Promise<boolean> {
  const config = await StoreConfiguration.findOne({ shop });
  if (!config) {
    logger.info('StoreConfiguration not found', { shop });
    return false;
  }
  return !!config.autoFulfillOrders;
}

function hasDonateMeProducts(orderData: any): boolean {
  return orderData.line_items?.some((item: any) => item.vendor === 'DonateMe');
}

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
    const autoFulfill = await isAutoFulfillEnabled(shop);
    if (!autoFulfill) {
      logger.info('Auto fulfill not enabled for store', { shop });
      return false;
    }

    if (!hasDonateMeProducts(orderData)) {
      logger.info('Order does not have DonateMe products', { shop, orderId: orderData.id });
      return false;
    }

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

    const fulfillableOrder = fulfillmentOrders.find((edge: any) =>
      edge.node.status === 'OPEN' && edge.node.lineItems.edges.length > 0
    );

    if (!fulfillableOrder) {
      logger.error('No fulfillable orders found', { shop, orderId: orderData.id });
      return false;
    }

    const fulfillmentOrder = fulfillableOrder.node;
    const fulfillmentOrderId = fulfillmentOrder.id;

    const donateMeLineItems = orderData.line_items.filter((item: any) => item.vendor === 'DonateMe');

    for (const item of donateMeLineItems) {
      const productGID: string = toShopifyGID("Product", item.product_id);
      const productInDb = await Product.findOne({ shopifyProductId: productGID, shop, isDeleted: false });
      if (!productInDb) {
        logger.error('Product not found in DB for DonateMe order item', {
          shop,
          productId: productGID,
          orderId: orderData.id,
        });
        continue;
      }

      const variantGID = toShopifyGID("ProductVariant", item.variant_id);
      await checkAndCreateVariantIfMissing(shop, productInDb, variantGID, item, admin);
    }

    const donateMeFulfillmentItems = fulfillmentOrder.lineItems.edges
      .filter((edge: any) => edge.node.remainingQuantity > 0 && edge.node.lineItem.vendor === 'DonateMe')
      .map((edge: any) => ({
        id: edge.node.id,
        quantity: edge.node.remainingQuantity,
      }));

    if (!donateMeFulfillmentItems.length) {
      logger.error('No fulfillable DonateMe line items', { shop, orderId: orderData.id });
      return false;
    }
    // const trackingNumber = `DM-${orderData.id}`; // You can generate a more complex number if needed
    // const trackingCompany = "Canada Post tracking number";  // You can also store/retrieve courier name from DB
    // const trackingUrl = `https://www.canadapost-postescanada.ca/track-reperage/en#/filterPackage?searchFor=${trackingNumber}`;

    const fulfillmentResponse = await admin.graphql(FULFILLMENT_CREATE_MUTATION, {
      variables: {
        fulfillment: {
          lineItemsByFulfillmentOrder: [
            {
              fulfillmentOrderId,
              fulfillmentOrderLineItems: donateMeFulfillmentItems,
            },
          ],
        },
      },
    });

    const responseJson = await fulfillmentResponse.json();
    const userErrors = responseJson?.data?.fulfillmentCreate?.userErrors;
    const fulfillment = responseJson?.data?.fulfillmentCreate?.fulfillment;

     const fulfillmentStatus = fulfillment?.status || 'unknown';
    if (userErrors?.length > 0) {
      logger.error('Fulfillment creation failed', {
        errors: userErrors,
        shop,
        orderId: orderData.id,
      });
      throw new Error(userErrors[0].message);
    }

    const order = new Order({
      shop,
      orderId: orderData.id,
      orderNumber: orderData.name,
      fulfillmentStatus: fulfillmentStatus === 'SUCCESS' ? 'fulfilled' : 'unfulfilled',
      lineItems: donateMeLineItems.map((item: any) => ({
        id: item.id,
        productId: toShopifyGID("Product", item.product_id),
        variantId: toShopifyGID("ProductVariant", item.variant_id),
        quantity: item.quantity,
        price: item.price,
        vendor: item.vendor,
      })),
    });
    await order.save();
    console.log("Order saved in DB", order);

    logger.info('DonateMe items auto-fulfilled successfully', {
      shop,
      orderId: orderData.id,
      fulfillmentId: responseJson?.data?.fulfillmentCreate?.fulfillment?.id,
    });

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