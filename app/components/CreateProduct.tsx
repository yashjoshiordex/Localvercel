import {
  Modal,
  FormLayout,
  TextField,
  Text,
  // Toast,
  BlockStack,
  InlineStack,
  Button,
} from "@shopify/polaris";
import React, { useEffect, useState , memo } from "react";
import { type FC } from "react";
// import CustomToast from "./CustomToast";
// import { memo } from "react";
import { fetchData } from "app/utils/helper";
import type { IFormData, ValidationErrors, CreateDonationModalProps } from "app/interfaces/createProduct";
import usePlan from "app/context/PlanContext";
// import { on } from "events";

// eslint-disable-next-line react/display-name
const CreateProductModal: FC<CreateDonationModalProps> = memo(
  ({ open, onClose, id, fetchPage, onProductAction }) => {
    const [data, setData] = useState<any>();
    // const [gid, setGid] = useState<string>("");
    // const [toastActive, setToastActive] = useState({
    //   toggle: false,
    //   content: "",
    // });
    const [loader, setLoader] = useState<boolean>(false);
    const [validation, setValidation] = useState<boolean>(true);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
      presetValues: ["", "", ""]
    });
    // Add this state after the existing useState declarations
    const [showPresetValues, setShowPresetValues] = useState<boolean>(false);
    const { plan } = usePlan();
    // console.log("Plan context value:", plan);
    // const [showToast, setShowToast] = useState(false);

    const [formData, setFormData] = useState<IFormData>({
      productId: "",
      title: "",
      description: "",
      minimumDonationAmount: 5,
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
      // Only allow numeric input (including decimal)
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if not a valid number
      }

      setFormData((prevData) => {
        const updatedPresetValues = [...prevData.presetvalue];
        updatedPresetValues[index] = value;
        
        // Validate for duplicates and update errors
        const errors = validatePresetValues(updatedPresetValues);
        setValidationErrors({ presetValues: errors });

        return {
          ...prevData,
          presetvalue: updatedPresetValues,
        };
      });
    };

    const validatePresetValues = (values: string[]): string[] => {
      const errors = ["", "", ""];
      const numericValues = values.map(val => val === "" ? null : parseFloat(val));
      
      // Check for duplicates
      for (let i = 0; i < numericValues.length; i++) {
        if (numericValues[i] !== null && numericValues[i] !== undefined) {
          for (let j = i + 1; j < numericValues.length; j++) {
            if (numericValues[i] === numericValues[j] && numericValues[j] !== null) {
              errors[i] = "Duplicate value not allowed";
              errors[j] = "Duplicate value not allowed";
            }
          }
        }
      }

      return errors;
    };

    const handleSubmit = async () => {
      setLoader(true);

      if (!formData.title.trim()) {
        setValidation(false);
        setLoader(false);
        onProductAction?.(false, id ? 'edit' : 'create', "Product title should not be empty.");
        return;
      }

      // Validate preset values before submission
      const presetErrors = validatePresetValues(formData.presetvalue);
      const hasPresetErrors = presetErrors.some(error => error !== "");
      
      if (hasPresetErrors) {
        setValidationErrors({ presetValues: presetErrors });
        setLoader(false);
        return;
      }

      // Convert preset values to numbers, filter out empty values
      const validPresetValues = formData.presetvalue
        .filter(val => val !== "")
        .map(val => parseFloat(val));


      try {
        if (id !== "") {
          // const {presetvalue, ...data} = formData

        const payload = {
          productId: formData.productId,
          title: formData.title,
          description: formData.description,
          minimumDonationAmount: formData.minimumDonationAmount,
          sku: formData.sku,
          presetValue: validPresetValues,
          price: formData.price,
          goalAmount: formData.goalAmount,
        };

        const response = await fetch(`/api/updateProduct?id=${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        })
          if (response.ok) {
            setFormData({
              title: "",
              description: "",
              minimumDonationAmount: 5,
              sku: 0,
              presetvalue: ["", "", ""],
              price: 0,
              goalAmount: 0,
            });
            setValidationErrors({ presetValues: ["", "", ""] });
            onProductAction?.(true, 'edit', 'Product updated successfully!');
            onClose();
          } else {
            const errorData = await response.json().catch(() => ({}));
            onProductAction?.(false, 'edit', errorData.message || 'Failed to update product');
          }
        } else {
          // Create new product
          const { presetvalue, ...data } = formData;
          const response = await fetch("/api/createProduct", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
          });

          if (response.ok) {
            onProductAction?.(true, 'create', 'Product created successfully!');
            onClose();
          } else {
            const errorData = await response.json().catch(() => ({}));
            onProductAction?.(false, 'create', errorData.message || 'Failed to create product');
          }
        }
      } catch (error) {
        console.error("Error:", error);
        onProductAction?.(false, id ? 'edit' : 'create', 'An unexpected error occurred');
      } finally {
        setLoader(false);
      }
    };

    const handleClose = () => {
      setFormData({
        title: "",
        description: "",
        minimumDonationAmount: 5,
        sku: 0,
        presetvalue: [],
        price: 0,
        goalAmount: 0,
      });
      setValidationErrors({ presetValues: ["", "", ""] });
      setShowPresetValues(false); // Add this line
      onClose();
    };

    useEffect(() => {
      if (id) {
        fetchData(`/api/getproductbyid?id=${id}`, setData, setLoader);
      }
    }, [id]);

    useEffect(() => {
      if (data) {

        const hasPresetValues = data.data.presetValue && data.data.presetValue.length > 0;

        setFormData({
          title: data.data.title,
          description: data.data.description,
          minimumDonationAmount: data.data.minimumDonationAmount,
          sku: data.data.sku,
          presetvalue: data.data.presetValue || ["", "", ""],
          price: data.data.price,
          productId: data.data.id,
          goalAmount: data.data.goalAmount,
        });
        // Show preset values section if data has preset values
        setShowPresetValues(hasPresetValues);
        setValidationErrors({ presetValues: ["", "", ""] });
        setValidationErrors({ presetValues: ["", "", ""] });
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
                disabled={plan === "Free Plan"} 
              />
              {plan === "Free Plan" && (
                <div style={{ marginTop: "8px" }}>
                  <Text as="p" variant="bodySm" tone="subdued">
                    💡 Upgrade your Free Plan to set custom minimum donation values
                  </Text>
                </div>
              )}
            </div>

            <TextField
              label="Stock Keeping Unit (SKU)"
              value={formData?.sku?.toString()}
              onChange={(value) => handleInputChange("sku", value)}
              autoComplete="off"
            />

            {id && (
              <BlockStack gap="300">
                {!showPresetValues ? (
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => setShowPresetValues(true)}
                    >
                      Add Preset Values
                    </Button>
                    <div className="mt-2">
                      <Text as="p" tone="subdued" variant="bodySm">
                        Allow customers to choose from preset donation amounts
                      </Text>
                    </div>
                  </div>
                ) : (
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h2" variant="headingSm">
                        Present Values
                      </Text>
                      <Button
                        variant="tertiary"
                        tone="critical"
                        onClick={() => {
                          setShowPresetValues(false);
                          // Clear preset values when hiding
                          setFormData(prev => ({
                            ...prev,
                            presetvalue: ["", "", ""]
                          }));
                          setValidationErrors({ presetValues: ["", "", ""] });
                        }}
                      >
                        ✕
                      </Button>
                    </InlineStack>

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
                          error={validationErrors.presetValues[0]}
                          placeholder="Enter amount"
                          type="text"
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
                          error={validationErrors.presetValues[1]}
                          placeholder="Enter amount"
                          type="text"
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
                          error={validationErrors.presetValues[2]}
                          placeholder="Enter amount"
                          type="text"
                        />
                      </BlockStack>
                    </InlineStack>
                  </BlockStack>
                )}
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
        {/* {showToast && (
          <CustomToast
            content="Donation product saved successfully"
            onDismiss={() => setShowToast(false)}
          />
        )} */}
      </Modal>
    );
  },
);

const CreateProduct = memo(CreateProductModal);
export default CreateProduct;
