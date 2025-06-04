import {
  Page,
  Layout,
  Text,
  InlineStack,
  Button,
  Box,
  Image,
} from '@shopify/polaris';
import Logo from "../assets/images/donate-img.png"

export default function Thankyou() {
  return (
    <>
      <Page>
        <Layout>
          <Layout.Section>
            <Box
              background="bg-surface"
              padding="500"
              borderRadius="300">

              <div className="mb-3">
                {/* <InlineStack align="center" blockAlign="center">
                  <Image
                    source={Logo}
                    alt="DonateMe Logo"
                    width={80}
                  />
                </InlineStack> */}
              </div>

              <div className='text-center'>
                <Text as="h1" variant="headingLg">
                  Thank you for your donate me!
                </Text>

                <div className='my-3'>
                  <Text as="p" variant="bodyMd">
                    click Finish to complete the onboarding process.You can restart at any time by going to Donate me &gt; setting &gt; Restart onboarding.
                  </Text>
                </div>

                <Button variant="primary" >
                  Finish
                </Button>
              </div>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>

    </>
  );
}