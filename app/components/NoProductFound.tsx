import React from 'react'
import {
  Page,
  Card,
  Text,
  BlockStack,
  Button,
  Box,
  Image,
  Layout,
  Modal,
  TextField,
  FormLayout,
} from "@shopify/polaris";
import Notfound from "../assets/images/Notfound.png";

const NoProductFound = () => {
  return (
     <>
            <Layout>
              <Layout.Section>
                <Box background="bg-surface" padding="500" borderRadius="300">
                  <div className="d-flex justify-content-center align-items-center">
                    <Image
                      source={Notfound}
                      alt="Not product Found"
                      width={300}
                    />
                  </div>
                  <div className="text-center">
                    <Text as="h2" variant="headingMd">
                      No Donation Products Found
                    </Text>

                    <div className="my-3">
                      <Text as="p" tone="subdued" alignment="center">
                        Donation products are used to collect donations from
                        your customers.
                        <br />
                        You can create a donation product by clicking the button
                        below.
                      </Text>
                    </div>
                  </div>
                </Box>
              </Layout.Section>
            </Layout>
          </>
  )
}

export default NoProductFound