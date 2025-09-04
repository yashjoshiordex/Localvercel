import {
  Modal,
  FormLayout,
  TextField,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Checkbox
} from "@shopify/polaris";
import React, { useEffect, useState , memo } from "react";
import { type FC } from "react";
import { fetchData } from "app/utils/helper";
import type { IFormData, ValidationErrors, CreateDonationModalProps } from "app/interfaces/createProduct";
import usePlan from "app/context/PlanContext";
import Loader from "./Loader";

// eslint-disable-next-line react/display-name
const CreateProductModal: FC<CreateDonationModalProps> = memo(
  ({ open, onClose, id, fetchPage, onProductAction }) => {
    const [data, setData] = useState<any>();
    const [loader, setLoader] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
      presetValues: ["", "", ""]
    });

    const [presetValuesServerError, setPresetValuesServerError] = useState<string>("");
    // Add this state after the existing useState declarations
    const [showPresetValues, setShowPresetValues] = useState<boolean>(false);
    const { plan } = usePlan();

    const [formData, setFormData] = useState<IFormData>({
      productId: "",
      title: "",
      description: "",
      minimumDonationAmount: 5,
      sku: null,
      presetvalue: ["", "", ""],
      price: 10,
      goalAmount: null,
      isActive: true, 
    });

    const handleInputChange = (
      field: keyof typeof formData,
      value: string | number | boolean,
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
      setPresetValuesServerError(""); // Clear previous server errors

      if (!formData?.title.trim()) {
        setLoader(false);
        onProductAction?.(false, id ? 'edit' : 'create', "Product title should not be empty.");
        return;
      }

      if (!formData?.description.trim()) {
        setLoader(false);
        onProductAction?.(false, id ? 'edit' : 'create', "Product description should not be empty.");
        return;
      }

      if (
        formData?.minimumDonationAmount === "" ||
        formData?.minimumDonationAmount === null ||
        isNaN(Number(formData?.minimumDonationAmount))
      ) {
        setLoader(false);
        onProductAction?.(false, id ? 'edit' : 'create', "Minimum donation amount should not be empty.");
        return;
      }

      // Validate preset values before submission
      const presetErrors = validatePresetValues(formData?.presetvalue);
      const hasPresetErrors = presetErrors.some(error => error !== "");
      
      if (hasPresetErrors) {
        setValidationErrors({ presetValues: presetErrors });
        setLoader(false);
        return;
      }

      // Convert preset values to numbers, filter out empty values
      const validPresetValues = formData?.presetvalue
        .filter(val => val !== "")
        .map(val => parseFloat(val));


      try {
        if (id !== "") {

        const payload = {
          productId: formData?.productId,
          title: formData?.title,
          description: formData?.description,
          minimumDonationAmount: formData?.minimumDonationAmount,
          sku: formData?.sku,
          presetValue: validPresetValues,
          price: formData?.price,
          goalAmount: formData?.goalAmount,
          status: formData?.isActive ? "ACTIVE" : "DRAFT",
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
              sku: null,
              presetvalue: ["", "", ""],
              price: 0,
              goalAmount: null,
              isActive: true,
            });
            setValidationErrors({ presetValues: ["", "", ""] });
            setPresetValuesServerError(""); // Clear server error on success
            onProductAction?.(true, 'edit', 'Product updated successfully!');
            onClose();
          } else {
            const errorData = await response.json().catch(() => ({}));
            // Check if it's a preset values validation error
            if (errorData.error && errorData.error.includes("Preset values cannot be less than minimum donation amount")) {
              setPresetValuesServerError(errorData.error);
            } else {
              onProductAction?.(false, 'edit', errorData.message || 'Failed to update product');
            }
          }
        } else {
          // Create new product
          const { presetvalue,isActive, ...data } = formData;
          const response = await fetch("/api/createProduct", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              ...data,
              status: isActive ? "ACTIVE" : "DRAFT",
            }),
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
        console.warn("Error:", error);
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
        sku: null,
        presetvalue: [],
        price: 0,
        goalAmount: null,
        isActive: true,
      });
      setValidationErrors({ presetValues: ["", "", ""] });
      setShowPresetValues(false); // Add this line
      onClose();
    };

    useEffect(() => {
      if (id) {
        setLoader(true);
        fetchData(`/api/getproductbyid?id=${id}`, setData, (loading: boolean) => {
          setLoader(loading);
        });
      }
    }, [id]);

    useEffect(() => {
      if (data) {

        const hasPresetValues = data?.data?.presetValue && data?.data?.presetValue.length > 0;

        setFormData({
          title: data?.data?.title,
          description: data?.data?.description,
          minimumDonationAmount: data?.data?.minimumDonationAmount,
          sku: data?.data?.sku,
          presetvalue: data?.data?.presetValue || ["", "", ""],
          price: data?.data?.price,
          productId: data?.data?.id,
          goalAmount: data?.data?.goalAmount,
          isActive: data?.data?.status === "ACTIVE",
        });
        // Show preset values section if data has preset values
        setShowPresetValues(hasPresetValues);
        setValidationErrors({ presetValues: ["", "", ""] });
      }
    }, [data]);

    if (loader) {
      return <Loader />;
    }

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

            <InlineStack blockAlign="center">
              <div className="d-flex gap-2 align-items-center">
              <Text variant="bodyMd" as="span">
              Product Status
              </Text>
              <Checkbox
              checked={formData?.isActive}
              label="" // Hide label, since it's shown as Text
              onChange={(checked: boolean) => handleInputChange("isActive", checked)}
              />
</div>
            </InlineStack>
            <TextField
              label="Title *"
              value={formData?.title}
              onChange={(value) => handleInputChange("title", value)}
              autoComplete="off"
            />
            {/* {!validation && (
              <Text variant="bodyMd" as="p">
                Product title should not be empty.
              </Text>
            )} */}
            <TextField
              label="Description *"
              value={formData?.description}
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
                label="Minimum Donation Value *"
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
                      onClick={() => {
                        setShowPresetValues(true);
                        // Set default preset values when user chooses to add them
                        setFormData(prev => ({
                          ...prev,
                          presetvalue: ["10", "20", "30"]
                        }));
                      }}
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
                          value={formData?.presetvalue[0] }
                          error={validationErrors?.presetValues[0]}
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
                          value={formData?.presetvalue[1] }
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
                          value={formData?.presetvalue[2] }
                          error={validationErrors?.presetValues[2]}
                          placeholder="Enter amount"
                          type="text"
                        />
                      </BlockStack>
                    </InlineStack>
                      {presetValuesServerError && (
                        <div style={{ marginTop: "8px" }}>
                          <Text as="p" variant="bodySm" tone="critical">
                            {presetValuesServerError}
                          </Text>
                        </div>
                      )}
                  </BlockStack>
                )}
              </BlockStack>
            )}
            <div>
              <TextField
                type="number"
                label="Donation Goal Amount"
                value={formData?.goalAmount?.toString() ?? ""}
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

      </Modal>
    );
  },
);

const CreateProduct = memo(CreateProductModal);
export default CreateProduct;
