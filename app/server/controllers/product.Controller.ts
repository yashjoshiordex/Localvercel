// controllers/productController.ts
import { SessionModel } from "../models/mongoose-session-model";
import { Product } from "../models/Product";
import { CreateProductParams, ErrorResponse, ProductApiResponse, ProductDocument, UpdateProductParams } from "../types/product";
import { logger } from "../utils/logger";



export const createProductInDb = async ({
  shopifyProductId,
  title,
  variantId,
  sku,
  description,
  price,
  shop,
  goalAmount,
  minimumDonationAmount = null,
  status
}: CreateProductParams) => {
  try {

    const product = await Product.create({
      shopifyProductId,
      title,
      variantId,
      sku,
      description,
      price,
      shop,
      goalAmount,
      minimumDonationAmount,
      status
    });

    console.log("Product successfully created in DB:", product);

    return { success: true, product };
  } catch (err) {
    logger.error("DB save error", { error: err });
    console.error("Error saving product to DB:", err);

    return { success: false, error: "Failed to save to database" };
  }
};

export const getProducts = async (
  page: number,
  pageSize: number,
  shopName: string,
  status?: string | null,
  search?: string | null
): Promise<ProductApiResponse | ErrorResponse> => {
  try {
    const skip: number = (page - 1) * pageSize;

    // Build query object
    const query: any = {
      shop: shopName,
      isVariant: false, 
      isDeleted: false 
    };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      // Search in title 
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    logger.info("Querying products with filters", {
      page,
      pageSize,
      shop: shopName,
      status: status || 'All',
      hasSearchTerm: !!search
    });

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean() as unknown as ProductDocument[],
      Product.countDocuments(query),
    ]);

    const totalPages: number = Math.ceil(totalCount / pageSize);
    const hasNextPage: boolean = page < totalPages;
    const hasPrevPage: boolean = page > 1;

    const pagination = {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };

    logger.info("Products fetched successfully", {
      shop: shopName,
      count: products.length,
      totalCount,
      filters: { status: status || 'All', search: search || 'None' }
    });

    const responseData = {
      success: true,
      data: {
        products,
        pagination,
        shop: {
          name: shopName,
        },
        filters: {
          status: status || null,
          search: search || null
        }
      },
    };

    return responseData;
  } catch (error) {
    logger.error("Unexpected error while fetching products", { error, shop: shopName });
    return { success: false, error: "Failed to fetch products" };
  }
};

export const updateProductInDb = async ({
  productId,
  title,
  description,
  sku,
  price,
  goalAmount,
  minimumDonationAmount,
  presetValue,
  status 
}: UpdateProductParams) => {
  try {
    const mongoResult = await Product.findOneAndUpdate(
      { shopifyProductId: productId },
      {
        $set: {
          title,
          description,
          sku,
          price,
          minimumDonationAmount,
          goalAmount,
          presetValue: presetValue,
          status
        },
      },
      { upsert: true, new: true }
    );
    logger.info("MongoDB product update result:", mongoResult);
  } catch (mongoError) {
    logger.error("MongoDB update error:", mongoError);
    console.log("MongoDB update error:", mongoError);
  }
};

export async function softDeleteProductByShopifyId(shopifyProductId: string) {
  return Product.updateMany(
    { shopifyProductId },
    { isDeleted: true, status: null }
  );
}

export async function countActiveProductsByShop(shop: string): Promise<number> {
  try {
    const count = await Product.countDocuments({ 
      shop, 
      isDeleted: { $ne: true } 
    });
    
    return count;
  } catch (error) {
    logger.error(`Error counting products for shop ${shop}:`, error);
    throw error;
  }
}