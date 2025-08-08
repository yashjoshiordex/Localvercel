import { SET_PRODUCT_METAFIELD_MUTATION } from "app/server/mutations";
import { logger } from "app/server/utils/logger";

export async function setProductMetafield(
  admin: any,
  productId: string,
  value: (string | number)[],
  minimumDonationAmount: number // Default value if not provided
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

    // Set minimum donation amount metafield (if provided)
    if (minimumDonationAmount != null) {
      try {
        console.log("Setting minimum donation metafield", {
          productId,
          minimumDonationAmount
        });
        
        const minDonationResponse = await admin.graphql(SET_PRODUCT_METAFIELD_MUTATION, {
          variables: {
            metafields: [
              {
                ownerId: productId,
                namespace: "minimum_donation",
                key: "minimum_value",
                type: "number_integer", 
                value: String(minimumDonationAmount),
              },
            ],
          },
        });
        
        const minDonationResult = await minDonationResponse.json();
        
        if (minDonationResult?.data?.metafieldsSet?.userErrors?.length > 0) {
          logger.error("❌ Minimum donation metafield update failed", {
            errors: minDonationResult.data.metafieldsSet.userErrors,
            productId,
          });
          
          return {
            success: false,
            errors: minDonationResult.data.metafieldsSet.userErrors,
          };
        }
        
        logger.info("✅ Minimum donation metafield successfully set", {
          productId,
          minimumDonationAmount,
          metafield: minDonationResult?.data?.metafieldsSet?.metafields?.[0]
        });
        console.log("✅ Minimum donation metafield successfully set", {
          productId,
          minimumDonationAmount
        });
      } catch (error) {
        logger.error("Error setting minimum donation metafield:", error);
        console.log("Error setting minimum donation metafield:", error);
        return {
          success: false,
          errors: [{ message: "Error setting minimum donation metafield" }],
        };
      }
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
