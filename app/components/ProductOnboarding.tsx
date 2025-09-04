
import { Form, FormLayout, TextField, Button, Text, Image, InlineStack } from "@shopify/polaris";
import Productcreated from "./ProductCreated";
import { useEffect, useState } from "react";
import DonateWelcomeImage from '../assets/images/Donate-Image.png';

type IProps = {
  createProductCTA: Function;
  productCreated: boolean;
  setProductCreated: Function;
};

type IFormData = {
  title: string;
  description: string;
};

export default function ProductOnborading({
  createProductCTA,
  productCreated,
  setProductCreated,
}: IProps) {
  const [loader, setLoader] = useState<boolean>(false);
  // const [productCreated, setProductCreated] = useState<boolean>(false);
  const [formData, setFormData] = useState<IFormData>({
    title: "",
    description: "",
  });
  const [invalidInput, setInvalidInput] = useState<string[]>([]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    setLoader(false);
    setInvalidInput((fields) => fields.filter((f) => f !== field));
  };

  const handleValidation = () => {
    const invalidInputs: string[] = [];
    let validationToggle = true;

    if (formData.title === "") {
      invalidInputs.push("title");
      validationToggle = false;
    }
    if (formData.description === "") {
      invalidInputs.push("description");
      validationToggle = false;
    }
    if (invalidInputs.length > 0) {
      validationToggle = false;
    }

    setInvalidInput([...invalidInput, ...invalidInputs]);

    return validationToggle;
  };

  const handleSubmit = async () => {
    setLoader(true);
    if (handleValidation()) {
      const res = await fetch("/api/createProduct", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        setLoader(false);
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create product");
      }
      localStorage.setItem("product", JSON.stringify(formData.title));
      createProductCTA();
      setLoader(false);
    } else {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("product")) {
      createProductCTA();
    } else {
      setProductCreated(false);
    }
  }, []);

  return (
    <>
      {!productCreated ? (
        <>
          <Text
            as="h1"
            variant="headingLg"
            alignment="center"
            fontWeight="bold"
          >
            Create A Donation Product
          </Text>
<InlineStack align="center" blockAlign="center">
                  <Image source={DonateWelcomeImage} alt="Donateme Logo" width={200} />
                </InlineStack>
          <div className="text-center my-2">
            <Text variant="bodyMd" as="p" fontWeight="bold">
              The donation product will be how your customers add a donation to
              their cart.
            </Text>
          </div>

          <div className="text-center">
            <Text variant="bodyMd" as="p">
              Take a moment to create a basic product , you can customise the
              product later.
            </Text>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="custom-form">
              <FormLayout>
                <TextField
                  label="Product Title"
                  autoComplete="off"
                  onChange={(value) => handleInputChange("title", value)}
                  name="title"
                  value={formData?.title}
                />
                {invalidInput.includes("title") && (
                  <Text variant="bodyMd" as="p">
                    Product title should not be empty.
                  </Text>
                )}
                <TextField
                  label="Description"
                  autoComplete="off"
                  onChange={(value) => handleInputChange("description", value)}
                  name="description"
                  value={formData?.description}
                />
                {invalidInput.includes("description") && (
                  <div>
                    <Text variant="bodyMd" as="p">
                      Product description should not be empty.
                    </Text>
                  </div>
                )}
                <div className="text-center">
                  <Button
                    submit
                    variant="primary"
                    disabled={loader}
                    loading={loader}
                  >
                    Create Product
                  </Button>
                </div>
              </FormLayout>
            </div>
          </Form>
        </>
      ) :  <Productcreated />
      }
    </>
  );
}
