import { getOnlineStorePublicationId } from "../utils/getPublicationId";

export async function publishProductToOnlineStore(admin: any, productId: string) {
  const publicationId = await getOnlineStorePublicationId(admin);
  console.log("Publication ID:", publicationId);

  if (!publicationId) {
    return [{ message: "Failed to fetch Online Store publication ID." }];
  }

  const response = await admin.graphql(
    `
    mutation publishProduct($id: ID!, $publicationId: ID!) {
      publishablePublish(id: $id, input: { publicationId: $publicationId }) {
        publishable {
          ... on Product {
            id
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        id: productId,
        publicationId,
      },
    }
  );

  const result = await response.json();
  return result.data?.publishablePublish?.userErrors || [];
}
