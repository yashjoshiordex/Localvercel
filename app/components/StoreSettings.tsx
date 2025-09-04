// import {
//   Page,
//   Card,
//   Layout,
//   Select,
//   Checkbox,
//   Button,
//   Text,
//   Link,
// } from "@shopify/polaris";
// import { title } from "process";
// import { useState, useCallback, useEffect } from "react";

// export function StoreSettings() {
//   const [settings, setSettings] = useState({
//     postPurchaseProduct: "",
//     autoFulfillOrders: false,
//     requireShipping: false,
//     applySalesTax: false,
//   });
//   const [isSaving, setIsSaving] = useState(false);
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     fetchSettings();
//     fetchProducts();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       const response = await fetch("/api/setting");
//       if (response.ok) {
//         const data = await response.json();
//         setSettings(data);
//       }
//     } catch (error) {
//       console.error("Error fetching settings:", error);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await fetch("/api/get-products");
//       if (response.ok) {
//         const data = await response.json();
//         setProducts(data);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       const response = await fetch("/api/setting", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(settings),
//       });
//       if (!response.ok) throw new Error("Failed to save settings");
//     } catch (error) {
//       console.error("Error saving settings:", error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <Page title="General Settings">
//       <Layout>
//         <Layout.Section>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSave();
//             }}
//           >
//             <Card>
//               <div className="Polaris-Card__Section">
//                 <Text variant="headingMd" as="h2">
//                   Post-Purchase Product
//                 </Text>
//                 {/* <Select
//                   label="Select a donation product that will be displayed as the post-purchase donation request."
//                   options={[
//                     { label: "None", value: "" },
//                     ...products?.map((p: any) => ({
//                       label: p.title,
//                       value: p.id,
//                     })),
//                   ]}
//                   value={settings.postPurchaseProduct}
//                   onChange={(value: string) =>
//                     setSettings({ ...settings, postPurchaseProduct: value })
//                   }
//                   helpText="The default option is the original donation product."
//                 /> */}
//               </div>
//             </Card>

//             <div className="Polaris-Card__Section">
//               <Text variant="headingMd" as="h2">
//                 Auto Fulfil Donation Orders
//               </Text>
//               <Checkbox
//                 label="Auto Fulfil Orders"
//                 checked={settings.autoFulfillOrders}
//                 onChange={(checked) =>
//                   setSettings({ ...settings, autoFulfillOrders: checked })
//                 }
//                 helpText={
//                   <>
//                     Automatically mark all donations as fulfilled.{" "}
//                     <Link url="#">What's this?</Link>
//                   </>
//                 }
//               />
//             </div>

//             <div className="Polaris-Card__Section">
//               <Text variant="headingMd" as="h2">
//                 Apply Shipping
//               </Text>
//               <Checkbox
//                 label="Donation Products Require Shipping"
//                 checked={settings.requireShipping}
//                 onChange={(checked) =>
//                   setSettings({ ...settings, requireShipping: checked })
//                 }
//                 helpText={
//                   <>
//                     Donations do not require shipping in the cart by default.
//                     Change this behaviour here.{" "}
//                     <Link url="#">What's this?</Link>
//                   </>
//                 }
//               />
//             </div>

//             <div className="Polaris-Card__Section">
//               <Text variant="headingMd" as="h2">
//                 Sales Tax
//               </Text>
//               <Checkbox
//                 label="Add Sales Tax to Donation Products"
//                 checked={settings.applySalesTax}
//                 onChange={(checked) =>
//                   setSettings({ ...settings, applySalesTax: checked })
//                 }
//                 helpText={
//                   <>
//                     Include Sales Tax on your Donation orders.{" "}
//                     <Link url="#">What's this?</Link>
//                   </>
//                 }
//               />
//             </div>

//             <div className="Polaris-Card__Section"></div>
//             <Button variant="primary" submit loading={isSaving}>
//               Save
//             </Button>
//           </form>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }

import React, { useEffect, useState } from 'react';
import {
  Card,  
  Text,
  Button,
  TextField,
  Box,
  InlineStack,
  BlockStack,
  InlineGrid,
  DataTable
} from '@shopify/polaris';
import RichTextEditor from './RichTextEditor';
import { useNavigate } from '@remix-run/react';
import Loader from "./Loader";
import toast, { Toaster } from 'react-hot-toast';
// import '../css/manageproduct.css';

interface EmailConfigFormData {
  cc?: string[];
  template?: string;
}
interface StoreSettingsProps {
  onTabChange?: (tab: string) => void;
}

export default function StoreSettings({ onTabChange }: StoreSettingsProps) {
  const [autoFulfill, setAutoFulfill] = useState(false);
  
  const handleToggle = () => setAutoFulfill(!autoFulfill);
  const [addSalesTax, setAddSalesTax] = useState(false);
  const [requireShipping, setRequireShipping] = useState(false);
  const [fromEmail, setFromEmail] = useState('shop@partners-donation.myshopify.com');
  const [ccEmail, setCcEmail] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('Donation receipt');
  const [emailErrors, setEmailErrors] = useState({
    fromEmail: '',
    ccEmail: ''
  });
  const [loading, setLoading] = useState(true);
const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    postPurchaseProduct: "",
    autoFulfillOrders: false,
    requireShipping: false,
    applySalesTax: false,
  });
  
  // Store initial values to detect changes
  const [initialSettings, setInitialSettings] = useState({
    postPurchaseProduct: "",
    autoFulfillOrders: false,
    requireShipping: false,
    applySalesTax: false,
  });

  const [initialEmailConfig, setInitialEmailConfig] = useState({
    cc: '',
    template: '',
    subject: 'Donation receipt'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Validate single email
  const validateSingleEmail = (email: string, fieldName: string) => {
    if (!email.trim()) {
      setEmailErrors(prev => ({ ...prev, [fieldName]: '' }));
      return true;
    }
    
    if (!validateEmail(email)) {
      setEmailErrors(prev => ({ ...prev, [fieldName]: 'Please enter a valid email address' }));
      return false;
    }
    
    setEmailErrors(prev => ({ ...prev, [fieldName]: '' }));
    return true;
  };

  // Validate multiple emails (for CC field)
  const validateMultipleEmails = (emailString: string) => {
  if (!emailString.trim()) {
    setEmailErrors(prev => ({ ...prev, ccEmail: '' }));
    return true;
  }

  const emails = emailString.split(',').map(email => email.trim()).filter(email => email);
  
  // Check for duplicates
  const emailSet = new Set();
  const duplicates : string[]= [];
  
  emails.forEach(email => {
    const lowerEmail = email.toLowerCase();
    if (emailSet.has(lowerEmail)) {
      duplicates.push(email);
    } else {
      emailSet.add(lowerEmail);
    }
  });
  
  // Check for duplicate emails
  if (duplicates.length > 0) {
    setEmailErrors(prev => ({ 
      ...prev, 
      ccEmail: `Duplicate email(s) found: ${duplicates.join(', ')}` 
    }));
    return false;
  }
  
  // Check for invalid email formats
  const invalidEmails = emails.filter(email => !validateEmail(email));
  
  if (invalidEmails.length > 0) {
    setEmailErrors(prev => ({ 
      ...prev, 
      ccEmail: `Invalid email(s): ${invalidEmails.join(', ')}` 
    }));
    return false;
  }
  
  setEmailErrors(prev => ({ ...prev, ccEmail: '' }));
  return true;
};

  // Handle From Email change with validation
  const handleFromEmailChange = (value: string) => {
    setFromEmail(value);
    validateSingleEmail(value, 'fromEmail');
  };

  // Handle CC Email change with validation
  const handleCcEmailChange = (value: string) => {
    setCcEmail(value);
    validateMultipleEmails(value);
  };

  // Check if there are any email validation errors
  const hasEmailErrors = () => {
    return emailErrors.fromEmail !== '' || emailErrors.ccEmail !== '';
  };
  
  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/setting");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setInitialSettings(data);
        
        // Update state values based on fetched settings
        setAutoFulfill(data.autoFulfillOrders);
        setAddSalesTax(data.applySalesTax);
        setRequireShipping(data.requireShipping);
      } else {
        throw new Error( "Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    toast.error('Failed to load settings. Please refresh the page.', {
      duration: 4000,
      position: 'top-right',
    });
    } finally {
        setLoading(false);
      }

  };

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch("/api/email");
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          const ccEmails = data.config.cc ? data.config.cc.join(', ') : '';
          setCcEmail(ccEmails);
          setEmailTemplate(data.config.template || '');
          
          setInitialEmailConfig({
            cc: ccEmails,
            template: data.config.template || '',
            subject: emailSubject
          });
        }else {
          throw new Error("Email configuration not found");
        }
      }
    } catch (error) {
    console.error("Error fetching email config:", error);
    toast.error('Failed to load email configuration. Please refresh the page.', {
      duration: 4000,
      position: 'top-right',
    });
    }
  };

  // Update settings when checkboxes change
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      autoFulfillOrders: autoFulfill,
      applySalesTax: addSalesTax,
      requireShipping: requireShipping
    }));
  }, [autoFulfill, addSalesTax, requireShipping]);

  const hasSettingsChanged = () => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  };
  

  const handleChangePlanClick = () => {
    if (onTabChange) {
      // If onTabChange is provided (when used in MainApp), use tab switching
      onTabChange('plans');
    } else {
      // Fallback to navigation (when used standalone)
      navigate("/app/plans");
    }
  };

  const hasEmailConfigChanged = () => {
    const currentEmailConfig = {
      cc: ccEmail,
      template: emailTemplate,
      subject: emailSubject
    };
    return JSON.stringify(currentEmailConfig) !== JSON.stringify(initialEmailConfig);
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch("/api/setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to save settings");
    }
      setInitialSettings({ ...settings });
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    }
  };

  const handleSaveEmailConfig = async () => {
    try {
      const emailPayload: EmailConfigFormData = {
        cc: ccEmail ? ccEmail.split(',').map(email => email.trim()).filter(email => email) : [],
        template: emailTemplate,
      };

      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to save email settings");
    }
      
      setInitialEmailConfig({
        cc: ccEmail,
        template: emailTemplate,
        subject: emailSubject
      });
      return true;
    } catch (error) {
      console.error("Error saving email settings:", error);
      return false;
    }
  };

  const handleSaveAll = async () => {

    const fromEmailValid = validateSingleEmail(fromEmail, 'fromEmail');
    const ccEmailValid = validateMultipleEmails(ccEmail);
    
  if (!fromEmailValid || !ccEmailValid) {
    toast.error('Please fix email validation errors before saving', {
      duration: 4000,
      position: 'top-right',
    });
    return;
  }
    
    setIsSaving(true);
    
    try {
      const settingsChanged = hasSettingsChanged();
      const emailChanged = hasEmailConfigChanged();

    if (!settingsChanged && !emailChanged) {
      toast('No changes detected', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
      
      const promises = [];
      const saveTypes = [];

      if (settingsChanged) {
        promises.push(handleSaveSettings());
      saveTypes.push('general settings');
      }
      
      if (emailChanged) {
        promises.push(handleSaveEmailConfig());
        saveTypes.push('email configuration');
      }
      
      if (promises.length === 0) {
        console.log("No changes detected");
        return;
      }
      
      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result === true);
      
      if (allSuccessful) {

      const savedItems = saveTypes.join(' and ');
      toast.success(`${savedItems.charAt(0).toUpperCase() + savedItems.slice(1)} saved successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
        console.log("Settings saved successfully");
        // You can add a toast notification here
      } else {
      const failedCount = results.filter(result => result === false).length;
      toast.error(`${failedCount} setting(s) failed to save. Please try again.`, {
        duration: 4000,
        position: 'top-right',
      });
        console.error("Some settings failed to save");
      }
      
    } catch (error) {
    console.error("Error saving:", error);
    toast.error('An unexpected error occurred while saving settings', {
      duration: 4000,
      position: 'top-right',
    });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (hasInitialized) return;
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSettings(),
          fetchEmailConfig()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };
  
  loadData();

}, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  }

 const switchWrapper: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "10px 0",
  };

  const switchStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    width: "44px",
    height: "24px",
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  const sliderStyle: React.CSSProperties = {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: autoFulfill ? "#008060" : "#ccc",
    transition: "0.4s",
    borderRadius: "34px",
  };

  const sliderBefore: React.CSSProperties = {
    position: "absolute",
    height: "18px",
    width: "18px",
    left: autoFulfill ? "22px" : "4px",
    bottom: "3px",
    backgroundColor: "white",
    transition: "0.4s",
    borderRadius: "50%",
  };
  

  return (
      <Box background="bg-surface" paddingBlock="400">
        
        <Toaster />
        <div className="container">
          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <Text as="h2" variant="headingXl">
              General Settings
            </Text>
            {/* <Box paddingBlock="200">
              <div
                style={{
                  background: "#ECF1FB",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  width: "fit-content",
                  cursor:"pointer"
                }}
              >
                <InlineStack gap="200" blockAlign="center">
                  <Text as="span" variant="headingMd" fontWeight="medium">
                    Post-Purchase Product
                  </Text>
                </InlineStack>
              </div>
            </Box> */}
          </div>
          {/* Auto Fulfil Donation Orders */}
          {/* <Box paddingBlockEnd="400" paddingBlockStart="200">
            <Box borderWidth="025" borderColor="border" borderRadius="200">
              <Box padding="400">
                <Text as="h1" variant="headingMd">
                  Auto Fulfil Donation Orders
                </Text>
                <Checkbox
                  label="Auto Fulfil Orders"
                  checked={autoFulfill}
                  onChange={setAutoFulfill}
                />
                <Box paddingInlineStart="600">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Automatically mark all donations as fulfilled.{" "}
                    <a href="#">What’s this?</a>
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box> */}
          <Box paddingBlockEnd="400" paddingBlockStart="200">
      <Box borderWidth="025" borderColor="border" borderRadius="200">
        <Box padding="400">
           <Text as="h1" variant="headingMd">
                  Auto Fulfil Donation Orders
                </Text>
          
          <div style={switchWrapper}>            
            <label style={switchStyle}>
              <input
                type="checkbox"
                checked={autoFulfill}
                onChange={handleToggle}
                style={inputStyle}
              />
              <span style={sliderStyle}>
                <span style={sliderBefore}></span>
              </span>
            </label>

           
            <Text as="p" variant="bodyLg">
              Auto Fulfil Orders
            </Text>
          </div>

          
          <Box paddingInlineStart="1200">
            <Text as="p" variant="bodySm" tone="subdued">
              Automatically mark all donations as fulfilled.{" "}
              <a href="#">What’s this?</a>
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
          
          <Box paddingBlockEnd="400">
            <Box borderWidth="025" borderColor="border" borderRadius="200">
              <Box padding="400">
                <Text as="h1" variant="headingMd">
                  Sales Tax
                </Text>
                {/* <Checkbox
                  label="Add Sales Tax to Donation Products"
                  checked={addSalesTax}
                  onChange={setAddSalesTax}
                /> */}
                <div style={switchWrapper}>
           
            <label style={switchStyle}>
              <input
                type="checkbox"
                checked={autoFulfill}
                onChange={handleToggle}
                style={inputStyle}
              />
              <span style={sliderStyle}>
                <span style={sliderBefore}></span>
              </span>
            </label>

            
            <Text as="p" variant="bodyLg">
              Add Sales Tax to Donation Products
            </Text>
          </div>
                <Box paddingInlineStart="1200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Include Sales Tax on your Donation orders.{" "}
                    <a href="#">What’s this?</a>
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Box paddingBlockEnd="800">
            <Box borderWidth="025" borderColor="border" borderRadius="200">
              <Box padding="400">
                <Text as="h1" variant="headingMd">
                  Apply Shipping
                </Text>
                {/* <Checkbox
                  label="Donation Products Require Shipping"
                  checked={requireShipping}
                  onChange={setRequireShipping}
                /> */}
                <div style={switchWrapper}>
            
            <label style={switchStyle}>
              <input
                type="checkbox"
                checked={autoFulfill}
                onChange={handleToggle}
                style={inputStyle}
              />
              <span style={sliderStyle}>
                <span style={sliderBefore}></span>
              </span>
            </label>

            
            <Text as="p" variant="bodyLg">
              Donation Products Require Shipping
            </Text>
          </div>
                <Box paddingInlineStart="1200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Donations do not require shipping in the cart by default.
                    Change this behaviour here. <a href="#">What’s this?</a>
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* <Box borderWidth="025" borderColor="border" borderRadius="200">
            <InlineStack wrap={false} align="start">
              <Box width="50%" paddingInlineEnd="300" padding="400">
                <BlockStack gap="200">
                  <Text variant="headingLg" as="h1">
                    Order Tagging
                  </Text>
                  <Text as="p" variant="bodyMd">
                    It will automatically add the tags once order will place
                    with a donation Soft seat for the admin to filter the order
                    based on the donation tags.
                  </Text>
                </BlockStack>
              </Box>
              <div style={{ backgroundColor: "#ECF1FB" }}>
                <Box width="50%" padding="400">
                  <BlockStack gap="200">
                    <Text variant="headingLg" as="h1">
                      Upgrade To Advanced Plan
                    </Text>
                    <Text as="p" variant="bodySm">
                      Click on the upgrade now button and move to the Advanced
                      Plan. So, you can use the order tagging feature for your
                      order.
                    </Text>
                    <Button>Upgrade New</Button>
                  </BlockStack>
                </Box>
              </div>
            </InlineStack>
          </Box> */}
          <Box borderWidth="025" borderColor="border" borderRadius="200">
            <InlineGrid columns={{ xs: 1, md: "5fr 7fr" }} gap="0">
              {/* Left Section */}
              <Box padding="400">
                <BlockStack gap="300">
                  <Text variant="headingLg" as="h1">
                    Order Tagging
                  </Text>
                  <Text as="p" variant="bodyLg">
                    It will automatically add the tags once order will place
                    with a donation Soft seat for the admin to filter the order
                    based on the donation tags
                  </Text>
                </BlockStack>
              </Box>
              {/* Right Section */}
              <div style={{ backgroundColor: "#ECF1FB" }}>
                <Box padding="400">
                  <BlockStack gap="300">
                    <Text variant="headingLg" as="h1">
                      Upgrade To Advanced Plan
                    </Text>
                    <Text as="p" variant="bodyLg">
                      Click on the upgrade now button and move to the Advanced
                      Plan. So, you can use the order tagging feature for your
                      order
                    </Text>
                    <Box maxWidth="fit-content">
                      <div className="theme-btn">
                        <Button onClick={handleChangePlanClick}>Upgrade New</Button>
                      </div>
                    </Box>
                  </BlockStack>
                </Box>
              </div>
            </InlineGrid>
          </Box>
          <Box paddingBlock="400" paddingBlockStart="600">
            <Text as="h1" variant="headingLg">
              Email Configurations
            </Text>
            <Text as="span" variant="bodyLg">
              Set Email From and CC email address.
            </Text>
          </Box>
          {/* Form */}
          <Card>
            {/* From Field */}
            <Box width="80%">
              <TextField
                label="From"
                value={fromEmail}
                onChange={handleFromEmailChange}
                autoComplete="off"
                error={emailErrors.fromEmail}
              />
              <Text as="p" tone="subdued" variant="bodySm">
                From which email address mail should sent to customer
              </Text>
            </Box>
            {/* CC Field */}
            <Box width="80%" paddingBlockStart="400">
              <TextField
                label="CC"
                value={ccEmail}
                onChange={handleCcEmailChange}
                autoComplete="off"
                error={emailErrors.ccEmail}
                helpText="You can add multiple emails separated by commas."
              />
              <Text as="p" tone="subdued" variant="bodySm">
                Send a “carbon copy” of the email
              </Text>
            </Box>
          </Card>
          <Box paddingBlock="400" paddingBlockStart="800">
            <Text as="h1" variant="headingLg">
              Email Template
            </Text>
            <Text as="span" tone="subdued" variant="bodyLg">
              Customized receipt email template from here.
            </Text>
          </Box>
          <Box  borderWidth="025" borderColor="border" borderRadius="200">
             <Box width="80%" padding="400">
              <TextField
                label="Receipt Email Subject"
                value={emailSubject}
                onChange={setEmailSubject}
                autoComplete="off"
              />
            </Box>
            <Box width="80%" padding="400">
            <RichTextEditor
              value={emailTemplate}
              onChange={setEmailTemplate} 
            />
            </Box>
              <div className="custom-data-table-wrapper">
            <Box padding="400"  width="80%" >
             <Text as="span">You can use the below snippet in the email template</Text> 
             <Box borderWidth="025" borderColor="border" borderRadius="200">
              <DataTable
                columnContentTypes={["text", "text", "text", "text"]}
                headings={[
                  <Text key="name" as="span" alignment="center" fontWeight="bold">Labels</Text>,
                  <Text key="status" as="span" alignment="center" fontWeight="bold">Snippet</Text>,
                ]}
                rows={[
                  [
                    // Name Cell
                    <Box key="title-0">
                      <Text as="span" alignment="center">Customer Name:</Text>
                    </Box>,
            
                    // Status Cell
                    <Box key="status-0">
                      <Text as="span" alignment="center">{`{{donor_name}}`}</Text>
                    </Box>,
                  ],
                  [
                    <Box key="title-1">
                      <Text as="span" alignment="center">Donation Details:</Text>
                    </Box>,
            
                    <Box key="status-1">
                      <Text as="span" alignment="center">{`{{donor_details}}`}</Text>
                    </Box>,
                  ],
                  [
                    <Box key="title-1">
                      <Text as="span" alignment="center">Date</Text>
                    </Box>,
            
                    <Box key="status-1">
                      <Text as="span" alignment="center">{`{{date}}`}</Text>
                    </Box>,
                  ],
                  [
                    <Box key="title-1">
                      <Text as="span" alignment="center">Total Donation Amount:</Text>
                    </Box>,
            
                    <Box key="status-1">
                      <Text as="span" alignment="center">{`{{total}}`}</Text>
                    </Box>,
                  ]
                ]}
                increasedTableDensity
              />
            </Box>
            </Box>
             </div>
                
          </Box>
          <Box paddingBlock="800">
            <InlineStack align="end">
              <div className="theme-btn">
              <Button 
                onClick={handleSaveAll}
                loading={isSaving}
                disabled={!hasSettingsChanged() && !hasEmailConfigChanged() || hasEmailErrors()}
              >
                Save Settings
              </Button>
              </div>
            </InlineStack>
          </Box>
        </div>
      </Box>
  );
}