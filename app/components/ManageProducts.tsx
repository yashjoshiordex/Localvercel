// import React, { useState, useCallback, useEffect } from "react";
// import {
//   Page,
//   Card,
//   Button,
//   BlockStack,
//   InlineStack,
//   Text,
//   Badge,
//   DataTable,
//   Pagination,
// } from "@shopify/polaris";
// import CreateProduct from "./CreateProduct";
// import ConfirmationModalExample from "./ConfirmationModal";
// import NoProductFound from "./NoProductFound";
// import { fetchData } from "app/utils/helper";
// import { model } from "mongoose";
// import Loader from "./Loader";

// interface IProps {
//   data: DonationProduct[];
//   fetchAllData: Function;
// }

// interface DonationProduct {
//   _id: string;
//   title: string;
//   description: string;
//   sku: string;
//   price: number;
//   minimumDonationAmount: number;
//   shop: string;
//   shopifyProductId: string;
//   variantId: string;
//   createdAt: string;
//   updatedAt: string;
//   isDeleted: boolean;
//   __v: number;
// }

// export default function ManageProducts() {
//   const [data, setData] = useState<any>();
//   const [pagination, setPagination] = useState<any>();
//   const [loader, setLoader] = useState<boolean>(false);
//   const [active, setActive] = useState(false);
//   const [productId, setProductId] = useState<string>();
//   const [singleData, setSingleData] = useState<DonationProduct>();
//   const [modal, setModal] = useState({
//     isOpen: false,
//     id: "",
//   });

//   // Fetch all products data
//   // const fetchAllData = async () => {
//   //   const page = pagination?.currentPage ?? 1;
//   //   fetchData(
//   //     `/api/get-products?page=${page}&pageSize=10`,
//   //     setData,
//   //     setLoader,
//   //   );
//   // };

//   //   const fetchAllData = async () => {
//   //     const page = pagination?.currentPage ?? 1;
//   //   await fetchData(
//   //     `/api/get-products?page=${page}&pageSize=10`,
//   //     (res: any) => {
//   //       setData(res);
//   //       const paginationData = res?.getProductsData?.data?.pagination;
//   //       if (paginationData) {
//   //         setPagination(paginationData);
//   //       }
//   //     },
//   //     setLoader
//   //   );
//   // };

//  const fetchPage = async () => {
//     const page = pagination?.currentPage ?? 1;
//     await fetchData(
//       `/api/get-products?page=${page}&pageSize=10`,
//       (res: any) => {
//         setData(res);
//         const paginationData = res?.getProductsData?.data?.pagination;
//         if (paginationData) {
//           setPagination(paginationData);
//         }
//       },
//       setLoader,
//     );
//   };

//   const handlePrevious = () => {
//     if (pagination?.prevPage !== null) {
//       setPagination((prev: any) => ({
//         ...prev,
//         currentPage: prev.currentPage - 1,
//       }));
//     }
//   };

//   const handleNext = () => {
//     if (pagination?.nextPage !== null) {
//       setPagination((prev: any) => ({
//         ...prev,
//         currentPage: prev.currentPage + 1,
//       }));
//     }
//   };


//   const handleConfirmation = useCallback(async () => {
//     //APi call to delete the product
//     try {
//       const res = await fetch(`/api/deleteProduct?id=${productId}`, {
//         method: "DELETE",
//       });

//       if (res.status === 200) {
//         setActive(false);
//         fetchPage()
//       } else {
//         console.error("Failed to delete product ", productId);
//       }
//     } catch (error) {
//       console.error("Error", error);
//     }
//   }, [productId]);

//   useEffect(() => {
//     fetchPage();
//   }, []);

//   useEffect(() => {
//   if (pagination?.currentPage) {
//     fetchPage();
//   }
// }, [pagination?.currentPage]);


//   return (
//     <Page>
//       <div className="mb-3">
//         <InlineStack align="space-between" blockAlign="center">
//           <Text as="h1" variant="headingLg">
//             Donation Products
//           </Text>
//           <InlineStack gap="200">
//             {/* <Button>Manage POS Locations</Button> */}
//             <Button
//               variant="primary"
//               size="medium"
//               onClick={() => {
                
//                 setModal({ ...modal, isOpen: true });
//               }}
//             >
//               Create
//             </Button>
//           </InlineStack>
//         </InlineStack>
//       </div>

//       {data?.getProductsData?.data?.products?.length ? (
//         <>
//           {loader ? (
//             <Loader />
//           ) : (
//           <Card padding="200">
//             <DataTable
//               columnContentTypes={["text", "text", "text", "text"]}
//               headings={["Name", "Status", "Last Updated", "Actions"]}
//               rows={data?.getProductsData?.data?.products?.map(
//                 (item: DonationProduct) => [
//                   item.title!,
//                   item.isDeleted ? "Inactive" : "Active",
//                   new Date(item.updatedAt).toLocaleString(),
//                   <>
//                     <Button
//                       onClick={() => {
//                         setProductId(item.shopifyProductId);
//                         setActive(true);
//                       }}
//                     >
//                       Delete
//                     </Button>
//                     <Button
//                       size="slim"
//                       onClick={() => {
//                         // setProductId(item.shopifyProductId);
//                         // fetchDataById(item.shopifyProductId);
//                         setModal({
//                           ...model,
//                           id: item.shopifyProductId,
//                           isOpen: true,
//                         });
//                       }}
//                     >
//                       Edit
//                     </Button>
//                   </>,
//                 ],
//               )}
//               increasedTableDensity
//             />
//             {pagination?.totalPages > 1 && (
//               <div
//                 style={{
//                   marginTop: "20px",
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 {/* Previous/Next buttons */}
//                 <Pagination
//                   hasPrevious={pagination.hasPrevPage}
//                   hasNext={pagination.hasNextPage}
//                   onPrevious={() => {
//                     handlePrevious();
//                   }}
//                   onNext={() => {
//                     handleNext();
//                   }}
//                 />
//               </div>
//             )}
//           </Card>)}
//         </>
//       ) : (
//         data?.getProductsData?.data?.products?.length == 0 && <NoProductFound />
//       )}

//       <CreateProduct
//         open={modal.isOpen}
//         id={modal.id}
//         onClose={() => setModal({ ...modal, id:"",isOpen: false })}
//         fetchPage={fetchPage}
//       />

//       <ConfirmationModalExample
//         active={active}
//         setActive={setActive}
//         handleConfirmation={handleConfirmation}
//       />
//     </Page>
//   );
// }

import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  InlineStack,
  Text,
  Badge,
  DataTable,
  Pagination,
  Box,
  TextField,
  Icon,
} from "@shopify/polaris";
import toast, { Toaster } from 'react-hot-toast';
import CreateProduct from "./CreateProduct";
import ConfirmationModalExample from "./ConfirmationModal";
import NoProductFound from "./NoProductFound";
import { fetchData } from "app/utils/helper";
import { model } from "mongoose";
import Loader from "./Loader";
import FilterModal from "./FilterModel";
import { SearchIcon, FilterIcon } from "@shopify/polaris-icons";

// interface IProps {
  //   data: DonationProduct[];
  //   fetchAllData: Function;
  // }
  
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
  status: string;
}

export default function ManageProducts() {
  const [data, setData] = useState<any>();
  const [pagination, setPagination] = useState<any>();
  const [loader, setLoader] = useState<boolean>(false);
  const [active, setActive] = useState(false);
  const [productId, setProductId] = useState<string>();
  // const [singleData, setSingleData] = useState<DonationProduct>();
  //   const [currentPage, setCurrentPage] = useState(1); // ✅ define state
  const [modal, setModal] = useState({
    isOpen: false,
    id: "",
  });
  // Add these new state variables after existing useState declarations
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [tempFilterStatus, setTempFilterStatus] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

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
  
  // Build query parameters
  let queryParams = `page=${page}&pageSize=10`;
  
  if (searchQuery.trim()) {
    queryParams += `&search=${encodeURIComponent(searchQuery.trim())}`;
  }
  
  if (filterStatus) {
    queryParams += `&status=${encodeURIComponent(filterStatus)}`;
  }
    await fetchData(
      `/api/get-products?${queryParams}`,
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

const handleSearch = (value: string) => {
  setSearchQuery(value);
  // Reset to first page when searching
  setPagination((prev: any) => ({
    ...prev,
    currentPage: 1,
  }));
};

const handleFilterApply = () => {
  setFilterStatus(tempFilterStatus);
  setShowFilterModal(false);
  // Reset to first page when filtering
  setPagination((prev: any) => ({
    ...prev,
    currentPage: 1,
  }));
};

const handleFilterClear = () => {
  setTempFilterStatus("");
  setFilterStatus("");
  setShowFilterModal(false);
  // Reset to first page when clearing filter
  setPagination((prev: any) => ({
    ...prev,
    currentPage: 1,
  }));
};


  const handleConfirmation = useCallback(async () => {
    //APi call to delete the product
    try {
      const res = await fetch(`/api/deleteProduct?id=${productId}`, {
        method: "DELETE",
      });

      if (res.status === 200) {
        setActive(false);
        await fetchPage()
        toast.success('Product deleted successfully!', {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to delete product";
        console.error("Failed to delete product ", productId);
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error("Error", error);
      toast.error('An error occurred while deleting the product', {
        duration: 4000,
        position: 'top-right',
      });
    }
  }, [productId]);

  // Callback function to handle success/error from CreateProduct modal
  const handleProductAction = (success: boolean, action: 'create' | 'edit', message?: string) => {
    if (success) {
      const successMessage = message || `Product ${action === 'create' ? 'created' : 'updated'} successfully!`;
      toast.success(successMessage, {
        duration: 4000,
        position: 'top-right',
      });
      fetchPage(); // Refresh the data
    } else {
      const errorMessage = message || `Failed to ${action} product`;
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  // useEffect(() => {
  //   fetchPage();
  // }, []);

useEffect(() => {
  fetchPage();
}, [pagination?.currentPage, searchQuery, filterStatus]);

useEffect(() => {
  if (hasInitialized) return;

  const loadData = async () => {
  if (pagination?.currentPage || (!pagination?.currentPage && searchQuery) || (!pagination?.currentPage && filterStatus)) {
    fetchPage();
  }
  setHasInitialized(true);
  }
  loadData();
}, [pagination?.currentPage, searchQuery, filterStatus]);


  return (
      <div className="bg-white">
        <Toaster />

        <div className="container pt-3">
          <Box>
            <div className="mb-3">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h1" variant="headingXl">
                  Donation Products
                </Text>
                <InlineStack gap="200">
                  {/* <Button>Manage POS Locations</Button> */}
                  <div className="theme-btn">
                  <Button                 
                    
                    onClick={() => {
                      setModal({ ...modal, isOpen: true });
                    }}
                  >
                    Create
                  </Button>
                  </div>
                </InlineStack>
              </InlineStack>

            {/* Search and Filter Section */}
            <Box paddingBlockStart="400">
              <InlineStack gap="300" align="start">
                <div style={{ flex: 1, maxWidth: "400px" }}>
                  <TextField
                    label=""
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search products..."
                    prefix={<Icon source={SearchIcon} />}
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => handleSearch("")}
                  />
                </div>

                <InlineStack gap="100" blockAlign="center">
                  <Button
                    icon={FilterIcon}
                    onClick={() => {
                      setTempFilterStatus(filterStatus);
                      setShowFilterModal(true);
                    }}
                  >
                    Filter
                  </Button>
                  {filterStatus && (
                    <Badge tone="info">1</Badge>
                  )}
                </InlineStack>

                {(searchQuery || filterStatus) && (
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("");
                      setPagination((prev: any) => ({
                        ...prev,
                        currentPage: 1,
                      }));
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </InlineStack>
            </Box>
            </div>

            {data?.getProductsData?.data?.products?.length ? (
              <>
                {loader ? (
                  
                  <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader />
                  </div>
                ) : (
                  <>
                    <div className="custom-data-table-wrapper">
                      <Box
                        borderWidth="025"
                        borderColor="border"
                        borderRadius="200"
                      >
                        <DataTable
                          columnContentTypes={["text", "text", "text", "text"]}
                          headings={[
                            <Text key="name" as="span" alignment="center" variant="headingLg">
                              Name
                            </Text>,
                            <Text key="status" as="span" alignment="center" variant="headingLg">
                              Status
                            </Text>,
                            <Text key="updated" as="span" alignment="center" variant="headingLg">
                              Last Updated
                            </Text>,
                            <Text key="actions" as="span" alignment="center" variant="headingLg">
                              Actions
                            </Text>,
                          ]}
                          rows={data?.getProductsData?.data?.products?.map(
                            (item: DonationProduct, index: number) => [
                              // Name Cell

                              <Box key={`title-${index}`}>
                                <Text as="span" alignment="center" variant="bodyLg">
                                  {item.title}
                                </Text>
                              </Box>,

                              // Status Cell
                              <Box key={`status-${index}`}>
                                 <Badge tone={item.status == "Active" ? "success" : "critical"} >
                                  {item.status == "Active" ? "Active" : "Inactive"}
                                </Badge>
                              </Box>,

                              // Last Updated Cell
                              <Box key={`updated-${index}`}>
                                <Text as="span" alignment="center" variant="bodyLg">
                                  {new Date(item.updatedAt).toLocaleString()}
                                </Text>
                              </Box>,

                              // Actions Cell
                              <Box key={`actions-${index}`}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  <div
                                    onClick={() => {
                                      if (item.status === "Active") {
                                        setProductId(item.shopifyProductId);
                                        setActive(true);
                                      }
                                    }}
                                    style={{
                                      cursor: item.status === "Active" ? "pointer" : "not-allowed",
                                      opacity: item.status === "Active" ? 1 : 0.5,
                                    }}
                                  >
                                    <Badge tone="critical">
                                      Delete
                                    </Badge>
                                  </div>
                                  <div
                                    onClick={() => {
                                      if (item.status === "Active") {
                                        setModal({
                                          ...model,
                                          id: item.shopifyProductId,
                                          isOpen: true,
                                        });
                                      }
                                    }}
                                    style={{
                                      cursor: item.status === "Active" ? "pointer" : "not-allowed",
                                      opacity: item.status === "Active" ? 1 : 0.5,
                                    }}
                                  >
                                    <Badge>
                                      Edit
                                    </Badge>
                                  </div>
                                </div>
                              </Box>,
                            ],
                          )}
                          increasedTableDensity
                        />
                      </Box>
                    </div>

                    {pagination?.totalPages > 1 && (
                      <div
                        style={{
                          marginTop: "20px",
                          display: "flex",
                          justifyContent: "end",
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
                           label={`${pagination.totalCount} products, Page ${pagination.currentPage} of ${pagination.totalPages}`}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              data?.getProductsData?.data?.products?.length == 0 && (
                <NoProductFound />
              )
            )}

            <CreateProduct
              open={modal.isOpen}
              id={modal.id}
              onClose={() => setModal({ ...modal, id: "", isOpen: false })}
              fetchPage={fetchPage}
              onProductAction={handleProductAction}
            />

            <ConfirmationModalExample
              active={active}
              setActive={setActive}
              handleConfirmation={handleConfirmation}
            />
          <FilterModal
            open={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            tempFilterStatus={tempFilterStatus}
            setTempFilterStatus={setTempFilterStatus}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
          />


          </Box>
        </div>
      </div>
  );
}