// services/shopify/mutations.ts

export const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]!) {
    productCreate(product: $product, media: $media) {
      product {
        id
        title
        variants(first: 1) {
          edges {
            node {
              id
              sku
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const VARIANT_UPDATE_MUTATION = `
  mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        description
        variants(first: 1) {
          edges {
            node {
              id
              sku
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_ARCHIVE_MUTATION = `
  mutation productArchive($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const FULFILLMENT_CREATE_MUTATION = `
  mutation fulfillmentCreate($fulfillment: FulfillmentInput!) {
    fulfillmentCreate(fulfillment: $fulfillment) {
      fulfillment {
        id
        status
        trackingInfo {
          number
          url
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_VARIANT_CREATE_MUTATION = `
mutation productVariantCreate($input: ProductVariantInput!) {
  productVariantCreate(input: $input) {
    productVariant {
      id
      sku
      price
      title
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              attributes {
                key
                value
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CANCEL_SUBSCRIPTION_MUTATION = `
  mutation AppSubscriptionCancel($id: ID!) {
    appSubscriptionCancel(id: $id) {
      appSubscription {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;
