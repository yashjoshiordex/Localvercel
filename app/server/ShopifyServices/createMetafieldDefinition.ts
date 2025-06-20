type CreateMetafieldInput = {
  name: string;
  namespace: string;
  key: string;
  type: string;
  ownerType: "PRODUCT" | "VARIANT" | "COLLECTION" | "CUSTOMER";
};

export const createMetafieldDefinition = async (
  admin: any,
  input: CreateMetafieldInput
) => {
  const {
    name,
    namespace,
    key,
    type,
    ownerType,
  } = input;

  const checkQuery = `
  query CheckMetafieldDefinition {
    metafieldDefinitions(first: 1, namespace: "${namespace}", key: "${key}", ownerType: ${ownerType}) {
      edges {
        node {
          id
          name
          key
          type {
            name
          }
          ownerType
        }
      }
    }
  }
`;



  console.log(`🔍 Checking if metafield definition "${namespace}.${key}" already exists...`);

  try {
    const checkResponse = await admin.graphql(checkQuery);
    const checkResult = await checkResponse.json();

    const existingDefinition = checkResult?.data?.metafieldDefinitions?.edges?.[0]?.node;


    if (existingDefinition) {
      console.log(`✅ Metafield definition already exists:`, existingDefinition);

      const existingType = existingDefinition?.type?.name;

      if (existingType && existingType !== type) {
        console.error(`❌ Type conflict: existing type is "${existingType}", attempted to set type "${type}"`);
        return {
          success: false,
          error: `Metafield definition type mismatch. Expected "${existingType}", got "${type}".`,
        };
      }


      return {
        success: true,
        alreadyExists: true,
        definition: existingDefinition,
      };
    }



    console.log(`📌 Metafield definition not found. Proceeding to create "${namespace}.${key}"...`);

    const mutationQuery = `
  mutation CreateMetafieldDefinition {
    metafieldDefinitionCreate(definition: {
      name: "${name}",
      namespace: "${namespace}",
      key: "${key}",
      type: "${type}",
      ownerType: ${ownerType},
      access: {
        admin: true,
        storefront: true
      }
    }) {
      createdDefinition {
        id
        name
        key
        access {
          admin
          storefront
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;


    const mutationResponse = await admin.graphql(mutationQuery);
    const mutationResult = await mutationResponse.json();

    const errors = mutationResult?.data?.metafieldDefinitionCreate?.userErrors;

    if (errors?.length > 0) {
      console.error(`❌ Metafield creation failed with errors:`, errors);
      return {
        success: false,
        errors,
      };
    }

    const createdDefinition = mutationResult.data.metafieldDefinitionCreate.createdDefinition;

    console.log(`🎉 Metafield definition created successfully:`, createdDefinition);

    return {
      success: true,
      created: true,
      definition: createdDefinition,
    };
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`🔥 Exception while creating metafield definition:`, errorMessage);
    return {
      success: false,
      errors: [errorMessage],
    };
  }
};
