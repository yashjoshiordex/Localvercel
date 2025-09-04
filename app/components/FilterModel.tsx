import React from "react";
import {
  Modal,
  FormLayout,
  Select,
  Box,
} from "@shopify/polaris";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  tempFilterStatus: string;
  setTempFilterStatus: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
];

export default function FilterModal({
  open,
  onClose,
  tempFilterStatus,
  setTempFilterStatus,
  onApply,
  onClear,
}: FilterModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter Products"
      primaryAction={{
        content: "Apply Filter",
        onAction: onApply,
      }}
      secondaryActions={[
        {
          content: "Clear Filter",
          onAction: onClear,
        },
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
        <Box>
            <div style={{ maxWidth: "250px", width: "fit-content" }}>
                <Select
                    label="Status"
                    options={statusOptions}
                    value={tempFilterStatus}
                    onChange={setTempFilterStatus}
                />
            </div>
        </Box>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}