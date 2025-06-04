
import React from 'react';
import {
  Page,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  DataTable,
} from '@shopify/polaris';



export default function ProductDetailTable() {
 const rows = [
    [
      <Text fontWeight="bold" key="name" as="p">New Product</Text>,
      <Badge>Active</Badge>,
      '2025-05-09 05:58:06.860034',
      <Button size="slim" onClick={() => {}}>Edit</Button>,
    ],
     [
      <Text fontWeight="bold" key="name" as="p">Product</Text>,
      <Badge>Active</Badge>,
      '2025-05-09 05:58:06.860034',
      <Button size="slim" onClick={() => {}}>Edit</Button>,
    ],
  ];

  return (
    <Page
    >
        <div className='mb-3'>
        <InlineStack align="space-between" blockAlign="center">
        <Text as="h1" variant="headingLg">
          Donation Products
        </Text>
        <InlineStack gap="200">
          <Button>Manage POS Locations</Button>
          <Button variant="primary">Create</Button>
        </InlineStack>
      </InlineStack>

        </div>
      <Card padding="200">
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text']}
          headings={['Name', 'Status', 'Last Updated', 'Actions']}
          rows={rows}
          increasedTableDensity
        />
      </Card>
    </Page>
  );
}