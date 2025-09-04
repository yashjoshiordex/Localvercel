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
import Loader from "./Loader";
import FilterModal from "./FilterModel";
import { SearchIcon, FilterIcon } from "@shopify/polaris-icons";
import _ from 'lodash'; // Add this import
import NestedLoader from "./NestedLoader";
import usePlan from "app/context/PlanContext";
import { useNavigate } from "react-router-dom";
  
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

interface ManageProductsProps {
  onTabChange?: (tab: string) => void;
}

export default function ManageProducts({ onTabChange }: ManageProductsProps) {
  const [data, setData] = useState<any>();
  const [pagination, setPagination] = useState<any>();
  const [loader, setLoader] = useState<boolean>(false);
  const [tableLoader, setTableLoader] = useState<boolean>(false); 
  const [active, setActive] = useState(false);
  const [productId, setProductId] = useState<string>();
  const [modal, setModal] = useState({
    isOpen: false,
    id: "",
  });
  // Add these new state variables after existing useState declarations
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>(""); // Add this line
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [tempFilterStatus, setTempFilterStatus] = useState<string>("");

const [isInitialLoad, setIsInitialLoad] = useState(true);
const [paginationChanged, setPaginationChanged] = useState(false);
const { plan } = usePlan();
const navigate = useNavigate();

 const fetchPage = async (isSearchOperation = false) => {
  const page = pagination?.currentPage ?? 1;
  
  // Build query parameters
  let queryParams = `page=${page}&pageSize=10`;
  
  if (searchQuery?.trim()) {
    queryParams += `&search=${encodeURIComponent(searchQuery?.trim())}`;
  }
  
  if (filterStatus) {
    queryParams += `&status=${encodeURIComponent(filterStatus)}`;
  }

  // Use tableLoader for search/filter operations, loader for initial load
  const loaderSetter = isSearchOperation ? setTableLoader : setLoader;

    await fetchData(
      `/api/get-products?${queryParams}`,
      (res: any) => {
        setData(res);
        const paginationData = res?.getProductsData?.data?.pagination;
        if (paginationData) {
          setPagination(paginationData);
        }
      },
      loaderSetter,
    );
  };

const handlePrevious = () => {
  if (pagination?.prevPage !== null) {
    setPaginationChanged(true); // Mark as pagination change
    setPagination((prev: any) => ({
      ...prev,
      currentPage: prev?.currentPage - 1,
    }));
  }
};

const handleNext = () => {
  if (pagination?.nextPage !== null) {
    setPaginationChanged(true); // Mark as pagination change
    setPagination((prev: any) => ({
      ...prev,
      currentPage: prev?.currentPage + 1,
    }));
  }
};


  const debouncedSearch = useCallback(
    _.debounce((value: string) => {
      setSearchQuery(value);
      // Reset to first page when searching - don't mark as pagination change
      setPaginationChanged(false);
      setPagination((prev: any) => ({
        ...prev,
        currentPage: 1,
      }));
    }, 500),
    []
  );

const handleSearch = (value: string) => {

  setSearchInput(value); // Update input immediately for UI
  debouncedSearch(value);
};

const handleFilterApply = () => {
  setFilterStatus(tempFilterStatus);
  setShowFilterModal(false);
  setPaginationChanged(false);
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
  setPaginationChanged(false);
  // Reset to first page when clearing filter
  setPagination((prev: any) => ({
    ...prev,
    currentPage: 1,
  }));
};

const canCreateMoreProducts = () => {
  // If plan is not Free or Bronze, user can create unlimited products
  if (plan !== "Free Plan" && plan !== "Bronze Plan") {
    return true;
  }
  
  // For Free Plan and Bronze Plan, check if user already has products
  return !data?.getProductsData?.data?.products?.length;
};

  const handleTabChange = () => {
    if (onTabChange) {
      // If onTabChange is provided (when used in MainApp), use tab switching
      onTabChange('plans');
    } else {
      // Fallback to navigation (when used standalone)
      navigate("/app/plans");
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
        await fetchPage()
        toast.success('Product deleted successfully!', {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to delete product";
        console.warn("Failed to delete product ", productId);
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.warn("Error", error);
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


// Initial load
useEffect(() => {
  fetchPage(false);
  setIsInitialLoad(false);
}, []);

// Handle pagination changes only
useEffect(() => {
  if (isInitialLoad || !paginationChanged) return;
  
  const isSearchOrFilter = !!searchQuery || !!filterStatus;
  fetchPage(isSearchOrFilter);
  setPaginationChanged(false); // Reset flag
}, [pagination?.currentPage, paginationChanged]);

// Handle search and filter changes
useEffect(() => {
  if (isInitialLoad) return;
  
  fetchPage(true); // Always use tableLoader for search/filter
}, [searchQuery, filterStatus]);

// Update Clear All button handler
const handleClearAll = () => {
  setSearchInput("");
  setSearchQuery("");
  setFilterStatus("");
  setPaginationChanged(false); // Don't mark as pagination change
  setPagination((prev: any) => ({
    ...prev,
    currentPage: 1,
  }));
};

  if (loader) {
    return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  }

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
                  {/* <Button>Manage POS Locations</Button> */}
                {/* <InlineStack gap="200">
                  <div className="theme-btn">
                  <Button                 
                    
                    onClick={() => {
                      setModal({ ...modal, isOpen: true });
                    }}
                  >
                    Create
                  </Button>
                  </div>
                </InlineStack> */}

              <InlineStack gap="200">
                {canCreateMoreProducts() && (
                  <div className="theme-btn">
                    <Button
                      onClick={() => {
                        setModal({ ...modal, isOpen: true });
                      }}
                    >
                      Create
                    </Button>
                  </div>
                )}
              </InlineStack>
              </InlineStack>

            {/* Search and Filter Section */}
            <Box paddingBlockStart="400">
              <InlineStack gap="300" align="start">
                <div style={{ flex: 1, maxWidth: "400px" }}>
                  <TextField
                    label=""
                    value={searchInput}
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

                {(searchInput || filterStatus) && (
                  <Button
                    variant="tertiary"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                )}
              </InlineStack>
            </Box>
            </div>

            {data?.getProductsData?.data?.products?.length ? (
              <>
              <div className="custom-data-table-wrapper">
                <Box
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                >
                  {tableLoader ? (

                    <div style={{ backgroundColor: "#ffffff", minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <NestedLoader />
                    </div>
                  ) : (
                    <div style={{ minHeight: "50vh" }}>
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
                                {item?.title}
                              </Text>
                            </Box>,

                            // Status Cell
                            <Box key={`status-${index}`}>
                              <Badge tone={item?.status == "ACTIVE" ? "success" : "info"} >
                                {item?.status == "ACTIVE" ? "Active" : "Draft"}
                              </Badge>
                            </Box>,

                            // Last Updated Cell
                            <Box key={`updated-${index}`}>
                              <Text as="span" alignment="center" variant="bodyLg">
                                {new Date(item?.updatedAt).toLocaleString()}
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
                                    // if (item.status === "ACTIVE") {
                                    setProductId(item?.shopifyProductId);
                                    setActive(true);
                                    // }
                                  }}
                                  style={{
                                    cursor: "pointer"
                                  }}
                                >
                                  <Badge tone="critical">
                                    Delete
                                  </Badge>
                                </div>
                                <div
                                  onClick={() => {
                                    // if (item.status === "ACTIVE") {
                                    setModal({
                                      ...modal,
                                      id: item?.shopifyProductId,
                                      isOpen: true,
                                    });
                                    // }
                                  }}
                                  style={{
                                    cursor: "pointer"
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
                    </div>)}
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
                    hasPrevious={pagination?.hasPrevPage}
                    hasNext={pagination?.hasNextPage}
                    onPrevious={() => {
                      handlePrevious();
                    }}
                    onNext={() => {
                      handleNext();
                    }}
                    label={`${pagination?.totalCount} products, Page ${pagination?.currentPage} of ${pagination?.totalPages}`}
                  />
                </div>
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

          {!canCreateMoreProducts() && (
            <Box paddingBlock="400">
              <Text as="span" tone="subdued">
                Your current plan ({plan}) allows only one donation product.
                <Button variant="plain" onClick={handleTabChange}>
                  Upgrade your plan 
                </Button>
                &nbsp;to create more products.
              </Text>
            </Box>
          )}

          </Box>
        </div>
      </div>
  );
}