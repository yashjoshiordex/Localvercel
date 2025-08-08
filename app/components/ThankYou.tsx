import {
  Page,
  Text,
  Box,
  Image,
} from '@shopify/polaris';
import { useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import gifticon from '../assets/images/Gift-Icon.png';

interface ThankYouProps {
  planId?: string | null;
  chargeId?: string | null;
}

export default function Thankyou({ planId: propPlanId, chargeId: propChargeId }: ThankYouProps) {

  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // const chargeId = searchParams.get("charge_id");
  // const planId = searchParams.get("plan");

  const chargeId = propChargeId || searchParams.get("charge_id");
  const planId = propPlanId || searchParams.get("plan");



  const fetchSubscriptionDetails = async () => {
  
    try {
      const response = await fetch(
        `/api/get-subscription?charge_id=${chargeId}&plan=${planId}`,
      );
      const data = await response.json();

      if (response.ok) {
        setSubscription(data);
      } else {
        setError(data.error || "Failed to fetch subscription details.");
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${(err as Error).message}`);
    }   };

  useEffect(() => {
    localStorage.clear();
      fetchSubscriptionDetails();
  }, []);

  return (
    <>

    <Page fullWidth>
       
    <Box>
     
      {/* <Box
              border="dashed"
              padding="200"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap="200"
            >
              
              <Image
                source="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
                alt="Donation Illustration"
                width={180}
              />
            </Box> */}
             {/* <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '2rem',
            padding: '2rem',
          }}>
           
             <Image
                source="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
                alt="Donation Illustration"
                width={180}
              />
          </div> */}
                  
                  {/* <Image source={DonateWelcomeImage} alt="Donateme Logo" width={200} /> */}

                  
      
      <div
      style={{
        display: 'flex',
        justifyContent: 'center', 
        flexDirection: 'column', 
        alignItems: 'center',      
        height: '50vh',           
        width: '100%',             
      }}
    >
      <Text as="h2" variant="headingLg">Thank You for Installing DonateMe!</Text>
      <Image source={gifticon} alt="Donateme Logo" width={80} />

                
                {/* Subscription Success Message */}
                {subscription && (
                  <Box 
                    background="bg-surface-success" 
                    padding="400" 
                    borderRadius="200"
                  >
                    <Text as="p" variant="bodyMd" tone="success">
                      {subscription.plan?.name || 'Your plan'} has been activated successfully!
                    </Text>
                  </Box>
                )}
                
      <Text as="p" variant="bodyMd" alignment="center">Click Finish to complete the onboarding process.<br />You can restart onboarding anytime by navigating to DonateMe &gt; Settings &gt; Restart Onboarding.</Text>
      </div>
      
    
                {error && (
                  <Box 
                    background="bg-surface-critical" 
                    padding="400" 
                    borderRadius="200"
                  >
                    <Text as="p" variant="bodyMd" tone="critical">
                      {error}
                    </Text>
                  </Box>
                )}
                
     
    </Box>
    </Page>
    </>
  );
}