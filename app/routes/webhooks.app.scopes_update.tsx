import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const {  session, topic, shop } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    // const current = payload.current as string[];
    if (session) {
        // await db.session.update({   
        //     where: {
        //         id: session.id
        //     },
        //     data: {
        //         scope: current.toString(),
        //     },
        // });
    }
    return new Response();
};
