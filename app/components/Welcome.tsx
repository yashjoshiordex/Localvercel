// Thank You for Installing DonateMe!
import {
  Text,
  Box,
  Page,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";


export default function Welcome() {
  return (
    <Page fullWidth>
      <Box paddingBlock="600" paddingInline="600">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <BlockStack gap="600">
            {/* Header Section */}
            <BlockStack gap="400" align="center">
              {/* <Image source={DonateWelcomeImage} alt="DonateMe Logo" width={100} /> */}
              
              <BlockStack gap="300" align="center">
                <Text as="h1" variant="headingXl" alignment="center">
                  Welcome to DonateMe
                </Text>
                <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                  Transform your store into a powerful fundraising platform
                </Text>
              </BlockStack>
            </BlockStack>

            {/* Main Content */}
            <BlockStack gap="500" align="center">
              {/* Description */}
              <Text variant="bodyMd" as="p" alignment="center">
                DonateMe helps charities, nonprofits, and socially conscious businesses 
                add flexible donation options to their Shopify stores.
              </Text>

              {/* Features Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '32px',
                textAlign: 'center',
                width: '100%',
                margin: '20px 0'
              }}>
                <BlockStack gap="200" align="center">
                  <div style={{ fontSize: '24px' }}>🎯</div>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">Custom Donations</Text>
                  <Text as="span" variant="bodySm" tone="subdued">Flexible pricing options</Text>
                </BlockStack>

                <BlockStack gap="200" align="center">
                  <div style={{ fontSize: '24px' }}>📊</div>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">Track Impact</Text>
                  <Text as="span" variant="bodySm" tone="subdued">Monitor your success</Text>
                </BlockStack>

                <BlockStack gap="200" align="center">
                  <div style={{ fontSize: '24px' }}>🚀</div>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">Easy Setup</Text>
                  <Text as="span" variant="bodySm" tone="subdued">Get started in minutes</Text>
                </BlockStack>
              </div>

              {/* Success Story */}
              <Box 
                background="bg-surface-secondary" 
                padding="400" 
                borderRadius="300"
                width="100%"
              >
                <Text as="span" variant="bodyMd" alignment="center" fontWeight="medium">
                  Join thousands of successful fundraisers who have raised millions 
                  of dollars with DonateMe worldwide.
                </Text>
              </Box>

              {/* Founder Message */}
              <BlockStack gap="300" align="center">
                <Text as="span" variant="bodyMd" alignment="center" tone="subdued">
                  "I hope DonateMe helps you achieve your fundraising goals!"
                </Text>
                
                <InlineStack align="center" gap="300">
                  {/* <Image source={userlogo} alt="Founder" width={32} /> */}
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    demo, Founder of DonateMe
                  </Text>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </BlockStack>
        </div>
      </Box>
    </Page>
  );
}