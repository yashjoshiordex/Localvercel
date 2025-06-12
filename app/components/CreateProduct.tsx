import {
  Modal,
  FormLayout,
  TextField,
  Text,
  Toast,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { type FC } from "react";
import CustomToast from "./CustomToast";
import { memo } from "react";
import { fetchData } from "app/utils/helper";
interface CreateDonationModalProps {
  open: boolean;
  onClose: () => void;
  id?: string | "";
  fetchPage: Function;
}

interface IFormData {
  productId?: string;
  title: string;
  description: string;
  minimumDonationAmount: number | null;
  sku: number | null | string;
  presetvalue: any[];
  price: number | null;
  goalAmount: number | null;
}

const CreateProductModal: FC<CreateDonationModalProps> = memo(
  ({ open, onClose, id, fetchPage }) => {
    const [data, setData] = useState<any>();
    const [gid, setGid] = useState<string>("");
    const [toastActive, setToastActive] = useState({
      toggle: false,
      content: "",
    });
    const [loader, setLoader] = useState<boolean>(false);
    const [validation, setValidation] = useState<boolean>(true);
    const [showToast, setShowToast] = useState(false);

    const [formData, setFormData] = useState<IFormData>({
      productId: "",
      title: "",
      description: "",
      minimumDonationAmount: null,
      sku: "0",
      presetvalue: ["", "", ""],
      price: 10,
      goalAmount: 0,
    });

    const handleInputChange = (
      field: keyof typeof formData,
      value: string | number,
    ) => {
      setFormData((prevData) => ({ ...prevData, [field]: value }));
      setLoader(false);
    };

    const handlePresetValue = (index: number, value: string) => {
      setFormData((prevData) => {
        const updatedPresetValues = [...prevData.presetvalue];
        updatedPresetValues[index] = value;
        return {
          ...prevData,
          presetvalue: updatedPresetValues,
        };
      });
    };

    const handleSubmit = async () => {
      setLoader(true);

      if (!formData.title.trim()) {
        setValidation(false);
        setLoader(false);
        return;
      }

      if (id !== "") {
        // const {presetvalue, ...data} = formData

        const payload = {
          productId: formData.productId,
          title: formData.title,
          description: formData.description,
          minimumDonationAmount: formData.minimumDonationAmount,
          sku: formData.sku,
          presetValue: formData.presetvalue,
          price: formData.price,
          goalAmount: formData.goalAmount,
        };

        await fetch(`/api/updateProduct?id=${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        })
          .then((res: any) => {
            res.json();
            setFormData({
              title: "",
              description: "",
              minimumDonationAmount: null,
              sku: 0,
              presetvalue: [],
              price: 0,
              goalAmount: 0,
            });
            fetchPage();
          })
          .then(
            (data: any) => (
              setToastActive({
                toggle: true,
                content: "Product created successfully!",
              }),
              onClose()
            ),
          )
          .catch((err: any) => console.error("Error fetching API:", err))
          .finally(() => setLoader(false));
      } else {
        const { presetvalue, ...data } = formData;
        await fetch("/api/createProduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        })
          .then((res) => {
            fetchPage();
            res.json();
          })
          .then(
            (data) => (
              setToastActive({
                toggle: true,
                content: "Product created successfully!",
              }),
              onClose()
            ),
          )
          .catch((err) => console.error("Error fetching API:", err))
          .finally(() => setLoader(false));
      }
    };

    const handleClose = () => {
      setFormData({
        title: "",
        description: "",
        minimumDonationAmount: null,
        sku: 0,
        presetvalue: [],
        price: 0,
        goalAmount: 0,
      });
      onClose();
    };

    useEffect(() => {
      if (id) {
        fetchData(`/api/getproductbyid?id=${id}`, setData, setLoader);
      }
    }, [id]);

    useEffect(() => {
      if (data) {
        setFormData({
          title: data.data.title,
          description: data.data.description,
          minimumDonationAmount: data.data.minimumDonationAmount,
          sku: data.data.sku,
          presetvalue: data.data.presetValue,
          price: data.data.price,
          productId: data.data.id,
          goalAmount: data.data.goalAmount,
        });
      }
    }, [data]);

    return (
      <Modal
        open={open}
        onClose={handleClose}
        title={
          id !== "" ? "Edit Donation Product" : "Create New Donation Product "
        }
        primaryAction={{
          content: "Save",
          loading: loader,
          onAction: () => {
            handleSubmit();
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              handleClose();
            },
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(value) => handleInputChange("title", value)}
              autoComplete="off"
            />
            {!validation && (
              <Text variant="bodyMd" as="p">
                Product title should not be empty.
              </Text>
            )}
            <TextField
              label="Description"
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              multiline
              autoComplete="off"
            />
            <div>
              <Text variant="headingSm" as="h6">
                Minimum Donation Value
              </Text>
              <Text tone="subdued" as="p">
                Set the minimum donation value that will be accepted. This will
                be applicable to the Online Store, Shopify POS and Post-Checkout
                donations.
              </Text>

              <TextField
                label="Minimum Donation Value"
                value={formData?.minimumDonationAmount?.toString()}
                onChange={(value) =>
                  handleInputChange("minimumDonationAmount", value)
                }
                autoComplete="off"
                disabled
              />
            </div>

            <TextField
              label="Stock Keeping Unit (SKU)"
              value={formData?.sku?.toString()}
              onChange={(value) => handleInputChange("sku", value)}
              autoComplete="off"
            />

            {id && (
              <BlockStack>
                <Text as="h2" variant="headingSm">
                  Preset Values
                </Text>
                <div className="mb-2">
                  <Text as="p" tone="subdued">
                    Allow customers to choose from preset donation amounts when
                    they view the donation widget. You can add up to three
                    preset values.
                  </Text>
                </div>
                <InlineStack gap="400" align="start">
                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      Value 1
                    </Text>
                    <TextField
                      label=""
                      autoComplete="off"
                      onChange={(value) => handlePresetValue(0, value)}
                      value={formData.presetvalue[0]}
                    />
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      Value 2
                    </Text>
                    <TextField
                      label=""
                      autoComplete="off"
                      onChange={(value) => handlePresetValue(1, value)}
                      value={formData.presetvalue[1]}
                    />
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text variant="bodySm" as="span" fontWeight="bold">
                      Value 3
                    </Text>
                    <TextField
                      label=""
                      autoComplete="off"
                      onChange={(value) => handlePresetValue(2, value)}
                      value={formData.presetvalue[2]}
                    />
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            )}
            <div>
              <TextField
                type="number"
                label="Donation Goal Amount"
                value={formData.goalAmount?.toString() ?? ""}
                min="0"
                step={0.01}
                onChange={(value) => {
                  const numberValue = value === "" ? null : parseFloat(value);
                  handleInputChange("goalAmount", numberValue!);
                }}
                autoComplete="off"
              />
            </div>
          </FormLayout>
        </Modal.Section>

        {/* {toastActive.toggle && (
        <Toast
          content="Donation product saved successfully"
          onDismiss={() =>
            setToastActive({ ...toastActive, toggle: !toastActive.toggle })
          }
        />
      )} */}
        {showToast && (
          <CustomToast
            content="Donation product saved successfully"
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Modal>
    );
  },
);

const CreateProduct = memo(CreateProductModal);
export default CreateProduct;
