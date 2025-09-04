
// export default Header;
import { Box, Button, Image, BlockStack, InlineStack } from "@shopify/polaris";
import DashboardLogo from "../assets/images/donateMeDashboardLogo.svg";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'manage', label: 'Manage Product' },
    { id: 'plans', label: 'Change Plan' },
    { id: 'settings', label: 'Settings' },
    { id: 'reports', label: 'Reports' },
    { id: 'help', label: 'Help' }
  ];

  return (
    <>
      <div style={{ backgroundColor: "#ECF1FB" }}>
        <Box paddingBlock="400">
          <div className="container">
            <BlockStack gap="400">
              {/* Logo */}
              <InlineStack gap="400" blockAlign="center">
                <Box position="relative">
                  <Image
                    source={DashboardLogo}
                    alt="Dashboard Logo"
                    width={200}
                  />
                </Box>
              </InlineStack>

              {/* Navigation */}
              <InlineStack gap="400">
                {tabs?.map((tab) => (
                  <div 
                    key={tab?.id}
                    className={`header-tab-btn ${activeTab === tab?.id ? 'active-tab' : ''}`}
                  >
                    <Button onClick={() => onTabChange(tab?.id)}>
                      {tab?.label}
                    </Button>
                  </div>
                ))}
              </InlineStack>
            </BlockStack>
          </div>
        </Box>
      </div>
    </>
  );
};

export default Header;