import { Form, FormLayout, TextField, Button, Text } from "@shopify/polaris";
import Productcreated from "./ProductCreated";
import { useEffect, useState } from "react";
import { set } from "mongoose";

type IProps = {
  createProductCTA: Function;
  productCreated: boolean;
  setProductCreated:Function
 };

type IFormData = {
  title: string;
};

export default function ProductOnborading({
  createProductCTA,
  productCreated,
  setProductCreated
}: IProps) {
  const [loader, setLoader] = useState<boolean>(false);
  // const [productCreated, setProductCreated] = useState<boolean>(false);
  const [formData, setFormData] = useState<IFormData>({
    title: "",
  });
  const [validation, setValidation] = useState<boolean>(true);

  const handleSubmit = async () => {
    setLoader(true);
    if (formData.title !== "") {
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
      setValidation(false);
    }
  };

  useEffect(()=>{
    if (localStorage.getItem("product")) {
      createProductCTA();
    } else {
      setProductCreated(false);
    }
  },[])

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
            Crearte A Donation Product
          </Text>

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
            <FormLayout>
              <TextField
                label="Product Title"
                autoComplete="off"
                onChange={(value) => {
                  setFormData({ ...formData, title: value });
                  setValidation(true);
                  setLoader(false);
                }}
                name="title"
                value={formData.title}
              />
              {!validation && (
                <Text variant="bodyMd" as="p">
                  Product title should not be empty.
                </Text>
              )}
              <div className="text-center">
                <Button submit variant="primary" disabled={loader} loading={loader}>
                  Create Product
                </Button>
              </div>
            </FormLayout>
          </Form>
        </>
      ) : (
        <Productcreated />
      )}
    </>
  );
}
