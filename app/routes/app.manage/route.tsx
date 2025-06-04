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
} from '@shopify/polaris';
import Notfound from '../../assets/images/Notfound.png';
import React, { useState, useCallback } from 'react';


import CreateDonationModal from '../../components/CreateProduct';

export default function ManageProduct() {
    const [active, setActive] = useState(false);

  const toggleModal = useCallback(() => setActive((active) => !active), []);
    return (
        <>
             <Page>
                  <Layout>
                      <Layout.Section>
                          <Box
                              background="bg-surface"
                              padding="500"
                              borderRadius="300"
                          >
                              <div className='d-flex justify-content-center align-items-center'>
                                  <Image
                                      source={Notfound}
                                      alt="Not product Found"
                                      width={300}
                                  />
                              </div>
                              <div className='text-center'>
                                  <Text as="h2" variant="headingMd">
                                      No Donation Products Found
                                  </Text>

                                  <div className='my-3'>
                                      <Text as="p" tone="subdued" alignment="center">
                                          Donation products are used to collect donations from your customers.
                                          <br />
                                          You can create a donation product by clicking the button below.
                                      </Text>
                                  </div>
                                  <Button variant='primary' size="medium" onClick={toggleModal}>
                                      Create
                                  </Button>
                              </div>
                          </Box>
                      </Layout.Section>
                  </Layout>
              </Page>
              <CreateDonationModal open={active} onClose={toggleModal} />
      
        </>
    )
}