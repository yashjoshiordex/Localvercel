import { SET_PRODUCT_METAFIELD_MUTATION } from "app/server/mutations";
import { logger } from "app/server/utils/logger";

export async function setProductMetafield(
  admin: any,
  productId: string,
  value: (string | number)[]
) {
  try {
    const stringifiedValue = JSON.stringify(value.map(Number));
    logger.info("🔧 Setting metafield for product", {
      productId,
      namespace: "donate",
      key: "preset_value",
      type: "list.number_integer",
      value: stringifiedValue,
    });
    console.log("🔧 Setting metafield for product",
      {
        productId,
        namespace: "donate",
        key: "preset_value",
        type: "list.number_integer",
        value: stringifiedValue,
      });

    const response = await admin.graphql(SET_PRODUCT_METAFIELD_MUTATION, {
      variables: {
        metafields: [
          {
            ownerId: productId,
            namespace: "donate",
            key: "preset_value",
            type: "list.number_integer",
            value: stringifiedValue,
          },
        ],
      },
    });

    const result = await response.json();

    if (result?.data?.metafieldsSet?.userErrors?.length > 0) {
      logger.error("❌ Shopify metafield update failed", {
        errors: result.data.metafieldsSet.userErrors,
        productId,
      });

      return {
        success: false,
        errors: result.data.metafieldsSet.userErrors,
      };
    }

    const updatedMetafield = result?.data?.metafieldsSet?.metafields?.[0];

    logger.info("✅ Metafield successfully set on product", {
      productId,
      metafield: updatedMetafield,
    });
    console.log("✅ Metafield successfully set on product", {
      productId,
      metafield: updatedMetafield,
    }
    );

    return {
      success: true,
      metafields: result?.data?.metafieldsSet?.metafields,
    };
  } catch (error) {
    logger.error("🔥 Unexpected error while setting metafield", {
      error: error instanceof Error ? error.message : String(error),
      productId,
    });
    console.log("🔥 Unexpected error while setting metafield",
      {
        error: error instanceof Error ? error.message : String(error),
        productId,
      }
    );


    return {
      success: false,
      errors: [
        { message: "Unexpected error occurred while setting metafield" },
      ],
    };
  }
}
