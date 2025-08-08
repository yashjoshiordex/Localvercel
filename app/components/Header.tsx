// import { Box, Button, Image, BlockStack, InlineStack } from "@shopify/polaris";
// import DashboardLogo from "../assets/images/donateMeDashboardLogo.svg";
// // import "../css/dashboard.css";

// const Header = () => {
//   return (
//     <>
//       {/* <div className="DashBoard-bg-section">
//         <div className=" container">
//           <div className="py-3">
//             <Box>
//               <Image
//                 source={DashboardLogo}
//                 alt="Shopify Dashboard logo"
//                 width={180}
//               />
//               <div className="pb-2 pt-3">
//                 <Box>
//                   <div className="d-flex flex-wrap gap-3">
//                     <div className="dashboard-tab-btn active-tab">
//                       <Button>Dashboard</Button>
//                     </div>
//                     <div className="dashboard-tab-btn">
//                       <Button>Manage Donation</Button>
//                     </div>
//                     <div className="dashboard-tab-btn">
//                       <Button>Change Plan</Button>
//                     </div>
//                     <div className="dashboard-tab-btn">
//                       <Button>Settings</Button>
//                     </div>
//                     <div className="dashboard-tab-btn">
//                       <Button>Reports</Button>
//                     </div>
//                     <span className="dashboard-tab-btn">
//                       <Button>Help</Button>
//                     </span>
//                   </div>
//                 </Box>
//               </div>
//             </Box>
//           </div>
//         </div>
//       </div> */}

//       <div style={{ backgroundColor: "#ECF1FB" }}>
//         <Box paddingBlock="400">
//           {/* Use div for maxWidth and margin properties */}
//           <div className="container">
//             <BlockStack gap="400">
//               {/* Logo */}
//               <InlineStack gap="400" blockAlign="center">
//                 <Box position="relative">
//                   <Image
//                     source={DashboardLogo}
//                     alt="Dashboard Logo"
//                     width={200}
//                   />{" "}
//                 </Box>
//               </InlineStack>

//               {/* Navigation */}
//               <InlineStack gap="400">
//                 <div className="header-tab-btn active-tab">
//                   <Button>Dashboard</Button>
//                 </div>

//                 <div className="header-tab-btn">
//                   <Button>Manage Donation</Button>
//                 </div>
//                 <div className="header-tab-btn">
//                   <Button>
//                     Change Plan
//                   </Button>
//                 </div>
//                 <div className="header-tab-btn">
//                   <Button>
//                     Settings
//                   </Button>
//                 </div>
//                 <div className="header-tab-btn">
//                   <Button>
//                     Reports
//                   </Button>
//                 </div>
//                 <div className="header-tab-btn">
//                   <Button>
//                     Help
//                   </Button>
//                 </div>
//               </InlineStack>
//             </BlockStack>
//           </div>
//         </Box>
//       </div>
//     </>
//   );
// };

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
                {tabs.map((tab) => (
                  <div 
                    key={tab.id}
                    className={`header-tab-btn ${activeTab === tab.id ? 'active-tab' : ''}`}
                  >
                    <Button onClick={() => onTabChange(tab.id)}>
                      {tab.label}
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