

import { Card, Page, Text, TextField, Checkbox, Select, Button, Layout, BlockStack ,Link} from '@shopify/polaris';
import { useState } from 'react';


export default function Setting() { 

 const [postPurchaseProduct, setPostPurchaseProduct] = useState('None');
  const [autoFulfill, setAutoFulfill] = useState(false);
  const [requireShipping, setRequireShipping] = useState(false);
  const [applyTax, setApplyTax] = useState(false);

  const productOptions = [
    { label: 'None', value: 'None' },
    { label: 'Donation Product 1', value: 'donation-1' },
    { label: 'Donation Product 2', value: 'donation-2' },
  ];

  return (
    <Page title="DonateMate for Donations">
      <Layout>
        <Layout.Section>      
            <BlockStack gap="400">
              {/* Post-Purchase Product */}
              {/* <Card>
              <BlockStack>
                <Text variant="headingMd" as="h2">Post-Purchase Product</Text>
                <div className='my-2'>
                <Text  variant="bodyMd" as="p">
                  Select a donation product that will be displayed as the post-purchase donation request. The default option is the original donation product
                </Text>
                </div>
                <Select
                  label="Select a donation product that will be displayed as the post-purchase donation request."
                  labelHidden
                  options={productOptions}
                  value={postPurchaseProduct}
                  onChange={setPostPurchaseProduct}
                />
              </BlockStack>
              </Card>
                */}
              <Card>
              {/* Auto Fulfill Donation Orders */}
              <BlockStack>
                <Text variant="headingSm" as="h2">Auto Fulfil Donation Orders</Text>
                <Checkbox
                  label="Auto Fulfil Orders"
                  checked={autoFulfill}
                  onChange={setAutoFulfill}
                
                />
                <div className='d-md-flex justify-content-between'>
                <Text variant="bodyMd" as="p">Automatically mark all DonateMate donations as fulfilled.</Text>
                 <Link url="" target="_blank">
                  What’s this?
                </Link>
                </div>
              </BlockStack>
              </Card>

              {/* Apply Shipping */}
              <Card>
              <BlockStack>
                <Text variant="headingSm" as="h2">Apply Shipping</Text>
                <Checkbox
                  label="Donation Products Require Shipping"
                  checked={requireShipping}
                  onChange={setRequireShipping}
                />

                 <div className='d-md-flex justify-content-between'>
                 <Text variant="bodyMd" as="p">Donations do not require shipping in the cart by default. Change this behaviour here.</Text>
                      <Link url="" target="_blank">
                  What’s this?
                </Link>
               </div>
              </BlockStack>
              </Card>


              {/* Sales Tax */}
              <Card>
              <BlockStack>
                <Text variant="headingSm" as="h2">Sales Tax</Text>
                <Checkbox
                  label="Add Sales Tax to Donation Products"
                  checked={applyTax}
                  onChange={setApplyTax}
                />
              </BlockStack>
              </Card>
              
               <Card>
              
                <Text variant="headingSm" as="h2">Restart Onboarding</Text>
                <Text variant="bodyMd" as="p">Restart the onboarding process. Your current settings and products will not be affected.</Text>
                  <Button variant="secondary">Restart</Button>
           
             </Card>


              <Card>
              <div className='text-center'>
                <Button variant='primary'>Save</Button>
              </div>
              </Card>
             
        
            </BlockStack>          
        </Layout.Section>
      </Layout>
    </Page>
     )
}