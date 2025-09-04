import { useState } from "react";
import { Page, Card, Button, Banner, Text } from "@shopify/polaris";

interface ArchiveResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export default function ArchivePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ArchiveResponse | null>(null);

  const handleArchiveProducts = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/archiveProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ArchiveResponse = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error archiving products:", error);
      setResponse({
        success: false,
        error: "Failed to archive products. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page
      title="Product Management"
      subtitle="Archive all active products in your store"
    >
      <Card>
        <div style={{ padding: "1rem" }}>
          <Text as="h2" variant="headingMd">
            Archive All Products
          </Text>

          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <Text as="p" variant="bodyMd" tone="subdued">
              This action will archive all active products in your Shopify store
              and mark them as deleted in the database. This action cannot be
              undone from this interface.
            </Text>
          </div>

          <Button
            variant="primary"
            tone="critical"
            loading={isLoading}
            onClick={handleArchiveProducts}
            disabled={isLoading}
          >
            {isLoading ? "Archiving Products..." : "Archive All Products"}
          </Button>

          {/* Success Message */}
          {response && response.success && (
            <div style={{ marginTop: "1rem" }}>
              <Banner tone="success">
                <Text as="p">
                  ✅ {response.message || "Products archived successfully!"}
                </Text>
              </Banner>
            </div>
          )}

          {/* Error Message */}
          {response && response.error && (
            <div style={{ marginTop: "1rem" }}>
              <Banner tone="critical">
                <Text as="p">❌ Error: {response.error}</Text>
              </Banner>
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}
