import React, { useState, useCallback } from "react";
import {
  Page,
  Card,
  Button,
  InlineStack,
  Text,
  DataTable,
} from "@shopify/polaris";
// import CreateDonationModal from "./CreateProduct";
import axios from "axios";
import CreateProduct from "./CreateProduct";
import ConfirmationModalExample from "./ConfirmationModal";

interface IProps {
  data: DonationProduct[];
  fetchAllData: Function;
}

interface DonationProduct {
  _id: string;
  title: string;
  description: string;
  sku: string;
  price: number;
  minimumDonationAmount: number;
  shop: string;
  shopifyProductId: string;
  variantId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  status: "ACTIVE" | "DRAFT";
  __v: number;
}

export default function ProductDetailTable({ data, fetchAllData }: IProps) {
  const [active, setActive] = useState(false);
  const [productId, setProductId] = useState<string>();
  const [singleData, setSingleData] = useState<DonationProduct >();
  const [modal, setModal] = useState({
    isOpen: false,
  });

  // const handleModal = () => setActive(!active);
  const fetchData = async (id: string) => {
    try {
      const res = await fetch(`/api/getproductbyid?id=${id}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json(); // <- await the JSON response
      // console.log("data BY ID", data.data);
      setSingleData(data?.data);
    } catch (error) {
      console.warn("Error while fetching products:", error);
    }
  };

  const handleConfirmation = useCallback(async () => {
    //APi call to delete the product
    try {
      const res = await axios.delete(`/api/deleteProduct?id=${productId}`);
      if (res.status === 200) {
        // console.log("Product deleted successfully");
        fetchAllData();
        setActive(false);
      } else {
        console.log("Failed to delete product");
      }
    } catch (error) {
      console.warn("Error", error);
    }
  }, [productId]);


  return (
    <>
      <Page>
        <div className="mb-3">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h1" variant="headingLg">
              Donation Products
            </Text>
            <InlineStack gap="200">
              <Button>Manage POS Locations</Button>
              <Button
                variant="primary"
                size="medium"
                onClick={() => setModal({ ...modal, isOpen: true })}
              >
                Create
              </Button>
            </InlineStack>
          </InlineStack>
        </div>
        <Card padding="200">
          <DataTable
            columnContentTypes={["text", "text", "text", "text"]}
            headings={["Name", "Status", "Last Updated", "Actions"]}
            rows={data.map((item: DonationProduct) => [
              item.title!,
              item.isDeleted ? "Inactive" : "Active",
              new Date(item.updatedAt).toLocaleString(),
              <>
                <Button
                  onClick={() => {
                    setProductId(item?.shopifyProductId);
                    setActive(true);
                  }}
                >
                  Delete
                </Button>
                <Button
                  size="slim"
                  onClick={() => {
                    fetchData(item?.shopifyProductId);
                    setModal({ isOpen: true });
                  }}
                >
                  Edit
                </Button>
              </>,
            ])}
            increasedTableDensity
          />
        </Card>
      </Page>
      <CreateProduct
        open={modal.isOpen}
        data={singleData}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      <ConfirmationModalExample
        active={active}
        setActive={setActive}
        handleConfirmation={handleConfirmation}
      />
    </>
  );
}
