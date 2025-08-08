import {
  Text,
  Box,
  BlockStack,
  InlineStack,
  Button,
  Image,
} from "@shopify/polaris";
import edit from "../assets/images/edit.svg";
const Help = () => {
  return (
    <>

        <Box background="bg-surface" paddingBlock="400">
          <div className="container">
            <Box>
              <BlockStack gap="600">
                {/* Main Heading */}
                <Text variant="headingXl" as="h1" fontWeight="semibold">
                  Looking for help?
                </Text>

                {/* Getting Started Section */}
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text variant="headingLg" as="h2" fontWeight="semibold">
                      Getting Started with App
                    </Text>
                    <Text as="span" variant="headingLg" fontWeight="regular">
                      Self-help articles & setup Instructions
                    </Text>
                  </BlockStack>

                  {/* Getting Started Box */}
                  <Box
                    padding="400"
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    background="bg-surface"
                  >
                    <BlockStack gap="300">
                      <Text as="h3" variant="headingLg" fontWeight="medium">
                        Follow these articles to get started with App
                      </Text>
                      <InlineStack gap="100" blockAlign="center">
                        <span className="d-flex  gap-2 mb-2 align-items-center">
                          <Text as="span" variant="heading2xl">
                            •
                          </Text>
                          <span style={{ color: "#6C8ED0" }}>
                            <Text
                              as="p"
                              variant="headingLg"
                              fontWeight="regular"
                              alignment="center"
                            >
                              Frequently Asked Questions
                            </Text>
                          </span>
                          <Image source={edit} alt="ExternalIcon" width={18} />
                        </span>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                </BlockStack>

                {/* Need Help Section */}
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text variant="headingLg" as="h2" fontWeight="semibold">
                      Need Help?
                    </Text>
                    <Text as="span" variant="headingLg" fontWeight="regular">
                      Our Customer Support team is here to make sure your store
                      is successful
                    </Text>
                  </BlockStack>

                  {/* Contact Support Box */}
                  <Box
                    padding="400"
                    borderWidth="025"
                    borderColor="border"
                    borderRadius="200"
                    background="bg-surface"
                  >
                    <BlockStack gap="400">
                      <BlockStack gap="300">
                        <InlineStack gap="100" wrap={false}>
                          <Text as="h4" variant="headingLg">
                            If you are facing issue in the app or you need to
                            style the Donation box. Feel free to contact us on
                            <span style={{ color: "#6C8ED0" }}>
                              {" "}
                              support@donateme.app
                            </span>{" "}
                            email address
                          </Text>
                        </InlineStack>
                      </BlockStack>

                      <div className="theme-btn">
                        <Button>Contact Us</Button>
                      </div>

                      <Text as="span" variant="headingLg" fontWeight="regular">
                        Our team of experts are always happy to answer
                        questions!
                      </Text>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Box>
          </div>
        </Box>
    </>
  );
};

export default Help;