// app/routes/api/mark-reinstall.tsx

import type { LoaderFunction } from "@remix-run/node";
import { SessionModel } from "app/server/models/mongoose-session-model";
import { authenticate } from "app/shopify.server";
import {logger} from "app/server/utils/logger"; // <-- Add this import

export const loader: LoaderFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop: string = session?.shop;
    if (!shop) {
        logger.error("Missing `shop` query parameter.");
        return ({ success: false, status: 400, message: "Missing `shop` query parameter." });
    }

    try {
        const result = await SessionModel.updateMany(
            { shop },
            {
                $set: {
                    isUninstall: false,
                },
            }
        );
        logger.info("Uninstall flag reset", { shop, modifiedCount: result.modifiedCount });
        return ({
            success: true,
            status: 200,
            message: `Flag reset for ${result.modifiedCount} session(s) of shop: ${shop}`,
        });
    } catch (error) {
        logger.error("Error updating session flags", { error });
        return ({ success: false, status: 500, message: "Error updating sessions." });
    }
};
