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
        taxable
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

// export const CREATE_METAFIELD_DEFINITION_MUTATION = `
//   mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
//     metafieldDefinitionCreate(definition: $definition) {
//       createdDefinition {
//         id
//         name
//         namespace
//         key
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

// export const SET_PRODUCT_METAFIELD_MUTATION = `
//   mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
//     metafieldsSet(metafields: $metafields) {
//       metafields {
//         id
//         key
//         namespace
//         value
//         type
//         ownerType
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

export const CREATE_METAFIELD_DEFINITION_MUTATION = `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
        namespace
        key
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const SET_PRODUCT_METAFIELD_MUTATION = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        namespace
        value
        type
        ownerType
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const INVENTORY_ITEM_UPDATE_MUTATION = `
  mutation InventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem {
        id
        sku
        requiresShipping
        tracked
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_INVENTORY_ITEM_ID = `
  query GetInventoryItemId($variantId: ID!) {
    productVariant(id: $variantId) {
      inventoryItem {
        id
        sku
        requiresShipping
      }
    }
  }
`;

export const PRODUCT_QUERY = `
    query getProducts($first: Int!, $after: String) {
      products(first: $first, after: $after, query: "status:active") {
        edges {
          node {
            id
            status
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

export  const  ARCHIVE_MUTATION = `
    mutation productUpdate($input: ProductInput!) {
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


export const PRODUCT_VARIANT_QUERY = `
mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      price
    }
    userErrors {
      field
      message
    }
  }
}
`

export const PRODUCT_ALL_VARIANTS_QUERY = `
  query GetAllVariants($id: ID!) {
    product(id: $id) {
      variants(first: 100) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`;

export const PRODUCT_DETAIL_QUERY = `
  query ProductDetails($id: ID!) {
    product(id: $id) {
      id
      title
      description
      vendor
      productType
      tags
      options {
        name
        values
      }
      variants(first: 15) {
        edges {
          node {
            id
            title
            sku
            price
            inventoryQuantity
            inventoryItem {
              id
              tracked
              requiresShipping
            }
          }
        }
      }
      images(first: 5) {
        edges {
          node {
            src
            altText
          }
        }
      }
    }
  }
`;
export const VARIANT_DETAIL_QUERY = `
query getVariantByID($id: ID!) {
  productVariant(id: $id) {
    id
    title
    sku
    price
    inventoryQuantity
    product {
      id
      title
    }
    metafields(first: 5) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
  }
}
`;

export const SHOP_CURRENCY_QUERY = `
        query GetShopCurrencyCode {
          shop {
            myshopifyDomain
            currencyCode
          }
        }
      `;

export const DELETE_PRODUCT_MUTATION = `
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

export const APP_USAGE_CHARGE_MUTATION = `
  mutation appUsageRecordCreate($subscriptionLineItemId: ID!, $price: MoneyInput!, $description: String!) {
    appUsageRecordCreate(
      subscriptionLineItemId: $subscriptionLineItemId
      price: $price
      description: $description
    ) {
      appUsageRecord {
        id
        price {
          amount
          currencyCode
        }
        description
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_PRODUCT_MUTATION_FOR_DOWN = `
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      shop {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;