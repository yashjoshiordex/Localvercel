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
  DataTable,
  Tooltip,
  Icon,
} from '@shopify/polaris';
import RichTextEditor from './RichTextEditor';
import { useNavigate } from '@remix-run/react';
import {  InfoIcon } from '@shopify/polaris-icons';
import Loader from "./Loader";
import toast, { Toaster } from 'react-hot-toast';
import usePlan from 'app/context/PlanContext';

import "../css/style.css";

interface EmailConfigFormData {
  subject: string;
  cc?: string[];
  template?: string;
}
interface StoreSettingsProps {
  onTabChange?: (tab: string) => void;
}

export default function StoreSettings({ onTabChange }: StoreSettingsProps) {
  const [autoFulfill, setAutoFulfill] = useState(false);
  
  // const handleToggle = () => setAutoFulfill(!autoFulfill);
  const [addSalesTax, setAddSalesTax] = useState(false);
  const [requireShipping, setRequireShipping] = useState(false);
  const [isEmailActive, setIsEmailActive] = useState(true);
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
  const [tagValue, setTagValue] = useState<string  | undefined>(undefined);

  const { plan } = usePlan();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<{
    postPurchaseProduct: string;
    autoFulfillOrders: boolean;
    requireShipping: boolean;
    applySalesTax: boolean;
    tagValue: string | null;
    isEmailActive: boolean; // Add this line
  }>({
    postPurchaseProduct: "",
    autoFulfillOrders: false,
    requireShipping: false,
    applySalesTax: false,
    isEmailActive: false, // Add this line
    tagValue: null
  });
  
  // Store initial values to detect changes
  const [initialSettings, setInitialSettings] = useState<{
    postPurchaseProduct: string;
    autoFulfillOrders: boolean;
    requireShipping: boolean;
    applySalesTax: boolean;
    tagValue: string | null;
  isEmailActive: boolean;
  }>({
    postPurchaseProduct: "",
    autoFulfillOrders: false,
    requireShipping: false,
    applySalesTax: false,
    tagValue: null,
    isEmailActive: false 
  });

  const [initialEmailConfig, setInitialEmailConfig] = useState({
    cc: '',
    template: '',
    subject: 'Donation receipt'
  });

  const [isSaving, setIsSaving] = useState(false);


const handleAutoFulfillToggle = () => setAutoFulfill(!autoFulfill);
const handleSalesTaxToggle = () => setAddSalesTax(!addSalesTax);
const handleShippingToggle = () => setRequireShipping(!requireShipping);
const handleEmailActiveToggle = () => setIsEmailActive(!isEmailActive);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email?.trim());
  };

  // Validate single email
  const validateSingleEmail = (email: string, fieldName: string) => {
    if (!email?.trim()) {
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
  if (!emailString?.trim()) {
    setEmailErrors(prev => ({ ...prev, ccEmail: '' }));
    return true;
  }

  const emails = emailString.split(',').map(email => email.trim()).filter(email => email);
  
  // Check for duplicates
  const emailSet = new Set();
  const duplicates: string[] = [];

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
        setAutoFulfill(data?.autoFulfillOrders);
        setAddSalesTax(data?.applySalesTax);
        setRequireShipping(data?.requireShipping);
      setIsEmailActive(data?.isEmailActive !== undefined ? data?.isEmailActive : false); // Set default if not present

      if(plan !== "Free Plan" && plan !== "Bronze Plan"){
       setTagValue(data.tagValue || undefined);
      }
      } else {
        throw new Error( "Failed to fetch settings");
      }
    } catch (error) {
      console.warn("Error fetching settings:", error);
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
        if (data?.config) {
          const ccEmails = data.config.cc ? data.config?.cc.join(', ') : '';
          setCcEmail(ccEmails);
          setEmailSubject(data.config?.subject || 'Donation Receipt');
        // If we have a custom template, use it
        if (data.config?.templateType === 'custom' && data.config?.template) {
          setEmailTemplate(data.config?.template);
        } else {
          // // Otherwise fetch the default template
         const simpleTemplate = `
          <p>Dear {{donor_name}},</p>
          <p>Thank you for your donation. Your generosity is appreciated! Below are your donation details</p>
          `;
          setEmailTemplate(simpleTemplate);
        }
          setInitialEmailConfig({
            cc: data.config?.cc ? data.config?.cc.join(', ') : '',
            template: data.config?.template || '',
            subject: data.config?.subject || 'Donation Receipt'
          });
        }else {
          throw new Error("Email configuration not found");
        }
      }
    } catch (error) {
    console.warn("Error fetching email config:", error);
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
      requireShipping: requireShipping,
      tagValue: tagValue || null, // Ensure tagValue is always a string or null
      isEmailActive: isEmailActive
    }));
  }, [autoFulfill, addSalesTax, requireShipping, tagValue, isEmailActive]);

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
      console.warn("Error saving settings:", error);
      return false;
    }
  };

  const handleSaveEmailConfig = async () => {
    try {
      const emailPayload: EmailConfigFormData = {
        subject: emailSubject,
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
      console.warn("Error saving email settings:", error);
      return false;
    }
  };

  const handleSaveAll = async () => {

  const settingsChanged = hasSettingsChanged();
  const emailChanged = hasEmailConfigChanged();

  if (!settingsChanged && !emailChanged) {
    toast.error('No changes detected to save', {
      duration: 4000,
      position: 'top-right',
    });
    return;
  }

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
        // console.log("Settings saved successfully");
        // You can add a toast notification here
      } else {
      const failedCount = results.filter(result => result === false).length;
      toast.error(`${failedCount} setting(s) failed to save. Please try again.`, {
        duration: 4000,
        position: 'top-right',
      });
        console.warn("Some settings failed to save");
      }
      
    } catch (error) {
    console.warn("Error saving:", error);
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
        console.warn("Error loading data:", error);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };
  
  loadData();

}, [plan]);

useEffect(() => {
  // Clear tagValue when plan changes to Free or Bronze
  if (plan === 'Free Plan' || plan === 'Bronze Plan') {
    setTagValue(undefined);
  }
  // console.log("Plan changed to:", plan);
}, [plan]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  }

const createSliderStyle = (isActive: boolean): React.CSSProperties => ({
  position: "absolute",
  cursor: "pointer",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: isActive ? "#6C8ED0" : "#ccc",
  transition: "0.4s",
  borderRadius: "34px",
});

const createSliderBefore = (isActive: boolean): React.CSSProperties => ({
  position: "absolute",
  height: "18px",
  width: "18px",
  left: isActive ? "22px" : "4px",
  bottom: "3px",
  backgroundColor: "white",
  transition: "0.4s",
  borderRadius: "50%",
});

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

  

  return (
    <Box background="bg-surface" paddingBlock="400">

      <Toaster />
      <Loader show={isSaving} />
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <Text as="h2" variant="headingXl">
            General Settings
          </Text>
        </div>
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
                    onChange={handleAutoFulfillToggle}
                    style={inputStyle}
                  />
                  <span style={createSliderStyle(autoFulfill)}>
                    <span style={createSliderBefore(autoFulfill)}></span>
                  </span>
                </label>


                <Text as="p" variant="bodyLg">
                  Auto Fulfil Orders
                  <Tooltip content="Automatically mark all donations as fulfilled.">
                    <span style={{ marginLeft: '4px', display: 'inline-flex', verticalAlign: 'middle' }}>
                      <Icon source={InfoIcon} />
                    </span>
                  </Tooltip>
                </Text>
              </div>
            </Box>
          </Box>
        </Box>
          
        <Box paddingBlockEnd="400">
          <Box borderWidth="025" borderColor="border" borderRadius="200">
            <Box padding="400">
              <Text as="h1" variant="headingMd">
                Sales Tax
              </Text>
              <div style={switchWrapper}>

                <label style={switchStyle}>
                  <input
                    type="checkbox"
                    checked={addSalesTax}
                    onChange={handleSalesTaxToggle}
                    style={inputStyle}
                  />
                  <span style={createSliderStyle(addSalesTax)}>
                    <span style={createSliderBefore(addSalesTax)}></span>
                  </span>
                </label>
                <Text as="p" variant="bodyLg">
                  Add Sales Tax to Donation Products
                  <Tooltip content="Include Sales Tax on your Donation orders.">
                    <span style={{ marginLeft: '4px', display: 'inline-flex', verticalAlign: 'middle' }}>
                      <Icon source={InfoIcon} />
                    </span>
                  </Tooltip>
                </Text>
              </div>
            </Box>
          </Box>
        </Box>
          
        <Box paddingBlockEnd="800">
          <Box borderWidth="025" borderColor="border" borderRadius="200">
            <Box padding="400">
              <Text as="h1" variant="headingMd">
                Apply Shipping
              </Text>
              <div style={switchWrapper}>

                <label style={switchStyle}>
                  <input
                    type="checkbox"
                    checked={requireShipping}
                    onChange={handleShippingToggle}
                    style={inputStyle}
                  />
                  <span style={createSliderStyle(requireShipping)}>
                    <span style={createSliderBefore(requireShipping)}></span>
                  </span>
                </label>


                <Text as="p" variant="bodyLg">
                  Donation Products Require Shipping
                  <Tooltip content="Donations do not require shipping in the cart by default. Change this behaviour here.">
                    <span style={{ marginLeft: '4px', display: 'inline-flex', verticalAlign: 'middle' }}>
                      <Icon source={InfoIcon}  />
                    </span>
                  </Tooltip>
                </Text>
              </div>
            </Box>
          </Box>
        </Box>

        <Box paddingBlockEnd="400">
          <Box borderWidth="025" borderColor="border" borderRadius="200">
            <Box padding="400">
              <Text as="h1" variant="headingMd">
                Email Notifications
              </Text>
              <div style={switchWrapper}>
                <label style={switchStyle}>
                  <input
                    type="checkbox"
                    checked={isEmailActive}
                    onChange={handleEmailActiveToggle}
                    style={inputStyle}
                  />
                  <span style={createSliderStyle(isEmailActive)}>
                    <span style={createSliderBefore(isEmailActive)}></span>
                  </span>
                </label>
                <Text as="p" variant="bodyLg">
                  Send receipt emails to customers
                  <Tooltip content="Enable or disable sending email receipts to customers when they make a donation.">
                    <span style={{ marginLeft: '4px', display: 'inline-flex', verticalAlign: 'middle' }}>
                      <Icon source={InfoIcon}  />
                    </span>
                  </Tooltip>
                </Text>
              </div>
            </Box>
          </Box>
        </Box>
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

                {/* Show input field if plan is not free */}
                {plan !== 'Free Plan' && plan !== "Bronze Plan" && (
                  <Box paddingBlockStart="300">
                    <TextField
                      label="Tag Value"
                      value={tagValue}
                      onChange={(value) => setTagValue(value)}
                      autoComplete="off"
                      placeholder="Enter tag value for donation orders"
                      helpText="This tag will be automatically added to orders containing donations"
                    />
                  </Box>
                )}
                </BlockStack>
              </Box>
              {/* Right Section */}
              { (plan !== "Gold Plan" ) &&
              <div style={{ backgroundColor: "#ECF1FB" }}>
                <Box padding="400">
                  <BlockStack gap="300">
                    <Text variant="headingLg" as="h1">
                      Upgrade To Gold Plan
                    </Text>
                    <Text as="p" variant="bodyLg">
                      Click on the upgrade now button and move to the Gold
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
              }
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
                error={emailErrors?.ccEmail}
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
            <div className={` theme-btn  ${!hasEmailConfigChanged() && !hasSettingsChanged() ? 'gray-current-plan' : ''} `}>
              <Button 
                onClick={handleSaveAll}
                loading={isSaving}
                disabled={hasEmailErrors() || (!hasSettingsChanged() && !hasEmailConfigChanged())}
                variant={!hasSettingsChanged() && !hasEmailConfigChanged() ? 'secondary' : 'primary'}
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