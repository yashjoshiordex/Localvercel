import { useEffect, useState } from "react";
import { Page } from "@shopify/polaris";
import Header from "./Header";
import Dashboard from "./Dashboard";
import ManageProducts from "./ManageProducts";
import SelectPlan from "./SelectPlan";
import StoreSettings from "./StoreSettings";
import Report from "./Report";
import Help from "./Help";
import PlanConfirmation from "./PlanConfirmation";
import { useSearchParams } from "@remix-run/react";

interface MainAppProps {
  initialTab?: string;
}

export default function MainApp({initialTab = 'dashboard'}: MainAppProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    const currentUrl = new URL(window.location.href);
    
    // Clean URL when navigating away from planconfirmation
    if (activeTab === 'planconfirmation' && tab !== 'planconfirmation') {
      // Clear all parameters and set only the tab
      const baseUrl = currentUrl.origin + currentUrl.pathname;
      const newUrl = `${baseUrl}?tab=${tab}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      // Normal tab change - just update the tab parameter
      currentUrl.searchParams.set('tab', tab);
      window.history.replaceState({}, '', currentUrl);
    }
  };

  // const handleTabChange = (tab: string) => {
  //   setActiveTab(tab);

  //   const newUrl = new URL(window.location.href);
  //   newUrl.searchParams.set('tab', tab);
  //   window.history.replaceState({}, '', newUrl);
  // };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={handleTabChange} />;
      case 'manage':
        return <ManageProducts onTabChange={handleTabChange} />;
      case 'plans':
        return <SelectPlan onTabChange={handleTabChange}/>;
      case 'settings':
        return <StoreSettings onTabChange={handleTabChange} />;
      case 'reports':
        return <Report onTabChange={handleTabChange}   />;
      case 'help':
        return <Help />;
      case 'planconfirmation':
        return <PlanConfirmation onTabChange={handleTabChange} />;
      default:
        return <Dashboard onTabChange={handleTabChange} />;
    }
  };

  return (
    <Page fullWidth>
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      {renderActiveComponent()}
    </Page>
  );
}