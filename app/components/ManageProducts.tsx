import React, { useState, useCallback, useEffect } from "react";
import {
  Page,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  DataTable,
  Pagination,
} from "@shopify/polaris";
import CreateProduct from "./CreateProduct";
import ConfirmationModalExample from "./ConfirmationModal";
import NoProductFound from "./NoProductFound";
import { fetchData } from "app/utils/helper";
import { model } from "mongoose";
import Loader from "./Loader";

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
  __v: number;
}

export default function ManageProducts() {
  const [data, setData] = useState<any>();
  const [pagination, setPagination] = useState<any>();
  const [loader, setLoader] = useState<boolean>(false);
  const [active, setActive] = useState(false);
  const [productId, setProductId] = useState<string>();
  const [singleData, setSingleData] = useState<DonationProduct>();
  const [modal, setModal] = useState({
    isOpen: false,
    id: "",
  });

  // Fetch all products data
  // const fetchAllData = async () => {
  //   const page = pagination?.currentPage ?? 1;
  //   fetchData(
  //     `/api/get-products?page=${page}&pageSize=10`,
  //     setData,
  //     setLoader,
  //   );
  // };

  //   const fetchAllData = async () => {
  //     const page = pagination?.currentPage ?? 1;
  //   await fetchData(
  //     `/api/get-products?page=${page}&pageSize=10`,
  //     (res: any) => {
  //       setData(res);
  //       const paginationData = res?.getProductsData?.data?.pagination;
  //       if (paginationData) {
  //         setPagination(paginationData);
  //       }
  //     },
  //     setLoader
  //   );
  // };

 const fetchPage = async () => {
    const page = pagination?.currentPage ?? 1;
    await fetchData(
      `/api/get-products?page=${page}&pageSize=10`,
      (res: any) => {
        setData(res);
        const paginationData = res?.getProductsData?.data?.pagination;
        if (paginationData) {
          setPagination(paginationData);
        }
      },
      setLoader,
    );
  };

  const handlePrevious = () => {
    if (pagination?.prevPage !== null) {
      setPagination((prev: any) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  const handleNext = () => {
    if (pagination?.nextPage !== null) {
      setPagination((prev: any) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };


  const handleConfirmation = useCallback(async () => {
    //APi call to delete the product
    try {
      const res = await fetch(`/api/deleteProduct?id=${productId}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        setActive(false);
        fetchPage()
      } else {
        console.error("Failed to delete product ", productId);
      }
    } catch (error) {
      console.error("Error", error);
    }
  }, [productId]);

  useEffect(() => {
    fetchPage();
  }, []);

  useEffect(() => {
  if (pagination?.currentPage) {
    fetchPage();
  }
}, [pagination?.currentPage]);


  return (
    <Page>
      <div className="mb-3">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h1" variant="headingLg">
            Donation Products
          </Text>
          <InlineStack gap="200">
            {/* <Button>Manage POS Locations</Button> */}
            <Button
              variant="primary"
              size="medium"
              onClick={() => {
                
                setModal({ ...modal, isOpen: true });
              }}
            >
              Create
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      {data?.getProductsData?.data?.products?.length ? (
        <>
          {loader ? (
            <Loader />
          ) : (
          <Card padding="200">
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={["Name", "Status", "Last Updated", "Actions"]}
              rows={data?.getProductsData?.data?.products?.map(
                (item: DonationProduct) => [
                  item.title!,
                  item.isDeleted ? "Inactive" : "Active",
                  new Date(item.updatedAt).toLocaleString(),
                  <>
                    <Button
                      onClick={() => {
                        setProductId(item.shopifyProductId);
                        setActive(true);
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      size="slim"
                      onClick={() => {
                        // setProductId(item.shopifyProductId);
                        // fetchDataById(item.shopifyProductId);
                        setModal({
                          ...model,
                          id: item.shopifyProductId,
                          isOpen: true,
                        });
                      }}
                    >
                      Edit
                    </Button>
                  </>,
                ],
              )}
              increasedTableDensity
            />
            {pagination?.totalPages > 1 && (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {/* Previous/Next buttons */}
                <Pagination
                  hasPrevious={pagination.hasPrevPage}
                  hasNext={pagination.hasNextPage}
                  onPrevious={() => {
                    handlePrevious();
                  }}
                  onNext={() => {
                    handleNext();
                  }}
                />
              </div>
            )}
          </Card>)}
        </>
      ) : (
        data?.getProductsData?.data?.products?.length == 0 && <NoProductFound />
      )}

      <CreateProduct
        open={modal.isOpen}
        id={modal.id}
        onClose={() => setModal({ ...modal, id:"",isOpen: false })}
        fetchPage={fetchPage}
      />

      <ConfirmationModalExample
        active={active}
        setActive={setActive}
        handleConfirmation={handleConfirmation}
      />
    </Page>
  );
}
