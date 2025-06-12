export async function getOnlineStorePublicationId(admin: any): Promise<string | null> {
  const response = await admin.graphql(`
    {
      publications(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);

  const result = await response.json();
  const publications = result?.data?.publications?.edges || [];

  const onlineStore = publications.find(
    (pub: any) => pub.node.name === "Online Store"
  );

  return onlineStore?.node?.id || null;
}
