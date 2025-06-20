import { Product } from "../models/Product";
import { ARCHIVE_MUTATION, PRODUCT_QUERY } from "../mutations";

export async function archiveAllProducts({ admin }: { admin: any }) {

  let hasNextPage = true;
  let cursor: string | null = null;
  let archivedCount = 0;
  let dbUpdatedCount = 0;

  while (hasNextPage) {
    const response: any = await admin?.graphql?.(PRODUCT_QUERY, {
      variables: {
        first: 100,
        after: cursor,
      },
    });

    const jsonRes = await response?.json?.();

    const productsData = jsonRes?.data?.products;
    console.log("productsData", productsData);
    if (!productsData) {
      console.error("❌ Failed to fetch products:", JSON.stringify(jsonRes?.errors || jsonRes));
      throw new Error("Failed to fetch products");
    }

    const products = productsData?.edges ?? [];
    console.log(`📦 Found ${products?.length} products on page with cursor: ${cursor}`);

    if ((products?.length ?? 0) === 0 && !cursor) {
      console.log("ℹ️ No active products to archive.");
      return { success: true, message: "No active products found." };
    }

    for (const { node } of products) {
      if (node?.status === "ACTIVE") {
        const archiveResponse = await admin?.graphql?.(ARCHIVE_MUTATION, {
          variables: {
            input: {
              id: node?.id,
              status: "ARCHIVED",
            },
          },
        });

        const archiveJson = await archiveResponse?.json?.();
        const errors = archiveJson?.data?.productUpdate?.userErrors || [];

        if (archiveJson?.errors || errors?.length > 0) {
          console.error(`❌ Failed to archive product ${node?.id}`, archiveJson?.errors || errors);
        } else {
          console.log(`✅ Archived product ${node?.id}`);
          archivedCount++;

           // Update in database - mark as deleted
          try {
            const dbUpdateResult = await Product.updateOne(
              { shopifyProductId: node?.id },
              { isDeleted: true }
            );

            if (dbUpdateResult.modifiedCount > 0) {
              console.log(`✅ Marked product ${node?.id} as deleted in database`);
              dbUpdatedCount++;
            } else {
              console.log(`⚠️ Product ${node?.id} not found in database or already marked as deleted`);
            }
          } catch (dbError) {
            console.error(`❌ Failed to update product ${node?.id} in database:`, dbError);
          }
        }
      }
    }

    hasNextPage = productsData?.pageInfo?.hasNextPage;
    cursor = productsData?.pageInfo?.endCursor;
  }

  if (archivedCount === 0) {
    console.log("ℹ️ No active products found to archive.");
    return { success: true, message: "No active products found." };
  }

  console.log(`✅ Finished archiving. Total archived in Shopify: ${archivedCount}, Updated in DB: ${dbUpdatedCount}`);
  return { 
    success: true, 
    message: `Archived ${archivedCount} product(s) in Shopify and updated ${dbUpdatedCount} product(s) in database.` 
  };
}