import {
  Modal,
  FormLayout,
  TextField,
  Text
} from '@shopify/polaris';
import React from 'react';

import { type FC } from 'react';

interface CreateDonationModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateDonationModal: FC<CreateDonationModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Donation Product"
      primaryAction={{
        content: 'Save',
        onAction: () => {
          // Save logic here
          onClose();
        },
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Title"
            value=""
            onChange={() => {}}
            autoComplete="off"
          />
          <TextField
            label="Description"
            value=""
            onChange={() => {}}
            multiline
            autoComplete="off"
          />
          <div>
            <Text variant="headingSm" as="h6">
              Minimum Donation Value
            </Text>
            <Text tone="subdued" as="p">
              Set the minimum donation value that will be accepted. This will be applicable to the Online Store, Shopify POS and Post-Checkout donations.
            </Text>

            <TextField
              label="Minimum Donation Value"
              value=""
              onChange={() => {}}
              autoComplete="off"
            />
          </div>

          <TextField
            label="Stock Keeping Unit (SKU)"
            value=""
            onChange={() => {}}
            autoComplete="off"
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}
export default CreateDonationModal;