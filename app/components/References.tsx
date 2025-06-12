import {
  Page,
  Card,
  Layout,
  Text,
  InlineStack,
  BlockStack,
  Icon,
  Button,
  InlineGrid,
  Box,
  Badge,
  Link,
} from '@shopify/polaris';

export default function DonationFeatures() {
  return (
    <div className='mb-2'>
      <div className='text-center mb-4'>
        <Text as="h1" variant="headingLg" >
          Select an option to add donate me to your sales channels
        </Text>
      </div>
      <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
        {/* Online Store Widget */}
        <Card roundedAbove="sm" padding="400">
          <BlockStack gap="300">
            <InlineStack align="start" gap="200">
              <Link url="https://seen-adasaurus-6ad.notion.site/Onboarding-2-2109865caa9d80ff8734fb380faf0202" target='_blank'>
              {/* <Icon source={GlobeMajor} tone="base" /> */}
              <Text as="h3" variant="headingSm">
                Add Donation Widget to Online Store
              </Text>
                        </Link>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              Add the DonateMe donation widget to your online store to
              enable customer donations during shopping.
            </Text>
            {/* <div>
              <Button variant="plain">Click here</Button>
            </div> */}
          </BlockStack>
        </Card>

        {/* In-Store POS Donations */}
        <Card roundedAbove="sm" padding="400">
          <BlockStack gap="300">
            <InlineStack align="start" gap="200">
              {/* <Icon source={StoreMajor} tone="base" /> */}
               <Link url="https://seen-adasaurus-6ad.notion.site/Onboarding-2-2109865caa9d80ff8734fb380faf0202" target='_blank'>
              <Text as="h3" variant="headingSm">
                Add Donation Tile on Shopify POS
              </Text>
              </Link>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              Allow customers to make a donation at the point of sale in
              your physical store.
            </Text>
            {/* <div>
              <Button variant="plain">Click here</Button>
            </div> */}
          </BlockStack>

        </Card>

        {/* Checkout Page Customization */}
        <Card roundedAbove="sm" padding="400">
          <BlockStack gap="300">
            <InlineStack align="start" gap="200">
          <Link url="https://seen-adasaurus-6ad.notion.site/Onboarding-2-2109865caa9d80ff8734fb380faf0202" target='_blank'>
              {/* <Icon source={CheckoutMajor} tone="base" /> */}
              <Text as="h3" variant="headingSm">
                Customization the  Checkout Page
              </Text>
            </Link>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              Customize the donation experience on your checkout page for
              maximum conversion.
              Required Shopify Plus
            </Text>
            {/* <div>
              <Button variant="plain">Click here</Button>
            </div> */}
          </BlockStack>
          
        </Card>
      </InlineGrid>
    </div>
  );
}
