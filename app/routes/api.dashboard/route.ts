import { LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { getStoreWithPlan } from "app/server/controllers/store.controller";
import { CustomError } from "app/server/utils/custom-error";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    try {
        const { planDoc } = await getStoreWithPlan(shop);
        return ({ plan: planDoc });
    } catch (error:unknown) {
        const status:number = error instanceof CustomError ? error.statusCode : 500;
        const message:string = error instanceof CustomError ? error.message : "Unexpected error";

        console.error(error);
        throw new Response(message, { status });
    }
};
