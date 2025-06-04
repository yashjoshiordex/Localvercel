import React, { useEffect, useState } from "react";
import {
  Text,
  Box,
} from "@shopify/polaris";
export default function Welcome() {

  useEffect(() => {
  const handleUninstall = async () => {
    try {
      const response = await fetch("/api/uninstall");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("Uninstall API response:", await response.json());
    } catch (error) {
      console.error("Failed to call uninstall API:", error);
    }
  };
  handleUninstall();
}, []);

  return (
    <Box>
      <Text as="h1" variant="headingLg" alignment="center" fontWeight="bold">
        Welcome to DonateMe for Donations
      </Text>
      <Box paddingBlock="400">
        <Text variant="bodyMd" as="p">
          DonateMe for Donations is a full-featured product customisation and upselling tool
          specifically designed for charities, nonprofits and businesses looking to add a
          custom price option to their store.
        </Text>
        <div className="my-2">
          <Text variant="bodyMd" as="p">
            Over the years, DonateMe has helped thousands of Shopify merchants raise millions
            of dollars for charities, nonprofits, and businesses.
          </Text>
        </div>
        <Text variant="bodyMd" as="p">
          This short on-boarding process will step you through the key points to get you set
          up and able to accept donations in your Shopify Store.
        </Text>
        <Text variant="bodyMd" as="p">
          I hope DonateMe can assist you with your fundraising goals. Please enjoy the app
          and if I can be of any assistance, please let me know. I’m here to help!
        </Text>
        <div className="mt-2">
          <Text variant="bodyMd" as="p" fontWeight="semibold">
            -demo (Founder of DonateMe)
          </Text>
        </div>
      </Box>
    </Box>
  )
}
