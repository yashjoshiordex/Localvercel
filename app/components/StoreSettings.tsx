import {
  Page,
  Card,
  Layout,
  Select,
  Checkbox,
  Button,
  Text,
  Link,
} from "@shopify/polaris";
import { title } from "process";
import { useState, useCallback, useEffect } from "react";

export function StoreSettings() {
  const [settings, setSettings] = useState({
    postPurchaseProduct: "",
    autoFulfillOrders: false,
    requireShipping: false,
    applySalesTax: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/setting");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/get-products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Page title="General Settings">
      <Layout>
        <Layout.Section>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <Card>
              <div className="Polaris-Card__Section">
                <Text variant="headingMd" as="h2">
                  Post-Purchase Product
                </Text>
                {/* <Select
                  label="Select a donation product that will be displayed as the post-purchase donation request."
                  options={[
                    { label: "None", value: "" },
                    ...products?.map((p: any) => ({
                      label: p.title,
                      value: p.id,
                    })),
                  ]}
                  value={settings.postPurchaseProduct}
                  onChange={(value: string) =>
                    setSettings({ ...settings, postPurchaseProduct: value })
                  }
                  helpText="The default option is the original donation product."
                /> */}
              </div>
            </Card>

            <div className="Polaris-Card__Section">
              <Text variant="headingMd" as="h2">
                Auto Fulfil Donation Orders
              </Text>
              <Checkbox
                label="Auto Fulfil Orders"
                checked={settings.autoFulfillOrders}
                onChange={(checked) =>
                  setSettings({ ...settings, autoFulfillOrders: checked })
                }
                helpText={
                  <>
                    Automatically mark all donations as fulfilled.{" "}
                    <Link url="#">What's this?</Link>
                  </>
                }
              />
            </div>

            <div className="Polaris-Card__Section">
              <Text variant="headingMd" as="h2">
                Apply Shipping
              </Text>
              <Checkbox
                label="Donation Products Require Shipping"
                checked={settings.requireShipping}
                onChange={(checked) =>
                  setSettings({ ...settings, requireShipping: checked })
                }
                helpText={
                  <>
                    Donations do not require shipping in the cart by default.
                    Change this behaviour here.{" "}
                    <Link url="#">What's this?</Link>
                  </>
                }
              />
            </div>

            <div className="Polaris-Card__Section">
              <Text variant="headingMd" as="h2">
                Sales Tax
              </Text>
              <Checkbox
                label="Add Sales Tax to Donation Products"
                checked={settings.applySalesTax}
                onChange={(checked) =>
                  setSettings({ ...settings, applySalesTax: checked })
                }
                helpText={
                  <>
                    Include Sales Tax on your Donation orders.{" "}
                    <Link url="#">What's this?</Link>
                  </>
                }
              />
            </div>

            <div className="Polaris-Card__Section"></div>
            <Button variant="primary" submit loading={isSaving}>
              Save
            </Button>
          </form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
