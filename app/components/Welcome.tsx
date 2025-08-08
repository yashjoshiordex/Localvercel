// import React, { useEffect, useState } from "react";
// import {
//   Text,
//   Box,
// } from "@shopify/polaris";
// export default function Welcome() {

//   useEffect(() => {
//   const handleUninstall = async () => {
//     try {
//       const response = await fetch("/api/uninstall");
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       console.log("Uninstall API response:", await response.json());
//     } catch (error) {
//       console.error("Failed to call uninstall API:", error);
//     }
//   };
//   handleUninstall();
// }, []);

//   return (
//     <Box>
//       <Text as="h1" variant="headingLg" alignment="center" fontWeight="bold">
//         Welcome to DonateMe for Donations
//       </Text>
//       <Box paddingBlock="400">
//         <Text variant="bodyMd" as="p">
//           DonateMe for Donations is a full-featured product customization and upselling tool
//           specifically designed for charities, nonprofits and businesses looking to add a
//           custom price option to their store.
//         </Text>
//         <div className="my-2">
//           <Text variant="bodyMd" as="p">
//             Over the years, DonateMe has helped thousands of Shopify merchants raise millions
//             of dollars for charities, nonprofits, and businesses.
//           </Text>
//         </div>
//         <Text variant="bodyMd" as="p">
//           This short on-boarding process will step you through the key points to get you set
//           up and able to accept donations in your Shopify Store.
//         </Text>
//         <Text variant="bodyMd" as="p">
//           I hope DonateMe can assist you with your fundraising goals. Please enjoy the app
//           and if I can be of any assistance, please let me know. I’m here to help!
//         </Text>
//         <div className="mt-2">
//           <Text variant="bodyMd" as="p" fontWeight="semibold">
//             -demo (Founder of DonateMe)
//           </Text>
//         </div>
//       </Box>
//     </Box>
//   )
// }

// import React, { useEffect, useState } from "react";
// import {
//   Text,
//   Box,
// } from "@shopify/polaris";
// export default function Welcome() {

//   useEffect(() => {
//   const handleUninstall = async () => {
//     try {
//       const response = await fetch("/api/uninstall");
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       console.log("Uninstall API response:", await response.json());
//     } catch (error) {
//       console.error("Failed to call uninstall API:", error);
//     }
//   };
//   handleUninstall();
// }, []);

//   return (
//     <Box>
//       <Text as="h1" variant="headingLg" alignment="center" fontWeight="bold">
//         Welcome to DonateMe for Donations
//       </Text>
//       <Box paddingBlock="400">
//         <Text variant="bodyMd" as="p">
//           DonateMe for Donations is a full-featured product customization and upselling tool
//           specifically designed for charities, nonprofits and businesses looking to add a
//           custom price option to their store.
//         </Text>
//         <div className="my-2">
//           <Text variant="bodyMd" as="p">
//             Over the years, DonateMe has helped thousands of Shopify merchants raise millions
//             of dollars for charities, nonprofits, and businesses.
//           </Text>
//         </div>
//         <Text variant="bodyMd" as="p">
//           This short on-boarding process will step you through the key points to get you set
//           up and able to accept donations in your Shopify Store.
//         </Text>
//         <Text variant="bodyMd" as="p">
//           I hope DonateMe can assist you with your fundraising goals. Please enjoy the app
//           and if I can be of any assistance, please let me know. I’m here to help!
//         </Text>
//         <div className="mt-2">
//           <Text variant="bodyMd" as="p" fontWeight="semibold">
//             -demo (Founder of DonateMe)
//           </Text>
//         </div>
//       </Box>
//     </Box>
//   )
// }


// import React, { useEffect, useState } from "react";
// import {
//   Text,
//   Box,
//   Page,
//   Image,
//   InlineStack,
//   Button
// } from "@shopify/polaris";
// import DonateWelcomeImage from '../assets/images/Donate-Image.png';
// import userlogo from '../assets/images/user-image.png';

// export default function Welcome() {

//   useEffect(() => {
//   const handleUninstall = async () => {
//     try {
//       const response = await fetch("/api/uninstall");
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       console.log("Uninstall API response:", await response.json());
//     } catch (error) {
//       console.error("Failed to call uninstall API:", error);
//     }
//   };
//   handleUninstall();
// }, []);

//   return (
//     <Page fullWidth>
//        {/* <InlineStack gap="400" blockAlign="center">
//                       <Box position="relative">
//                         <Image
//                           source={DashboardLogo}
//                           alt="Dashboard Logo"
//                           width={200}
//                         />{" "}
//                       </Box>
//                     </InlineStack> */}
//     <Box>
//       <Text as="h1" variant="headingLg" alignment="center" fontWeight="bold">
//         Welcome to DonateMe for Donations
//       </Text>
//       {/* <Box
//               border="dashed"
//               padding="200"
//               display="flex"
//               flexDirection="column"
//               alignItems="center"
//               justifyContent="center"
//               gap="200"
//             >
              
//               <Image
//                 source="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
//                 alt="Donation Illustration"
//                 width={180}
//               />
//             </Box> */}
//              {/* <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginTop: '2rem',
//             padding: '2rem',
//           }}>
           
//              <Image
//                 source="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
//                 alt="Donation Illustration"
//                 width={180}
//               />
//           </div> */}
//           <InlineStack align="center" blockAlign="center">
//                   <Image source={DonateWelcomeImage} alt="Donateme Logo" width={200} />
//                 </InlineStack>
//       <Box paddingBlock="400">
//         <Text variant="bodyMd" as="p" alignment="center">
//           DonateMe for Donations is a full-featured product customization and upselling tool
//           specifically designed for charities, nonprofits and businesses looking to add a
//           custom price option to their store.
//         </Text>
//         <div className="my-2">
//           <Text variant="bodySm" as="p" alignment="center">
//             Over the years, DonateMe has helped thousands of Shopify merchants raise millions
//             of dollars for charities, nonprofits, and businesses.
//           </Text>
//         </div>
//         <Text variant="bodySm" as="p" alignment="center">
//           This short on-boarding process will step you through the key points to get you set
//           up and able to accept donations in your Shopify Store.
//         </Text>
//         <Text variant="bodySm" as="p" alignment="center">
//           I hope DonateMe can assist you with your fundraising goals. Please enjoy the app
//           and if I can be of any assistance, please let me know. I’m here to help!
//         </Text>
//         <div className="mt-2">
//           <Text variant="bodySm" as="p" fontWeight="semibold" alignment="center">
//           <Image source={userlogo} alt="Donateme Logo" width={20} />  -demo (Founder of DonateMe)
//           </Text>
//         </div>
//         {/* <InlineStack align="start" blockAlign="center">
//           <div className="mt-md-0 mt-3 theme-btn">
//              <Button disabled>Buy shipping label</Button>
//              </div>    
//         </InlineStack> */}
//         {/* <InlineStack align="end" blockAlign="center">
//           <div className="mt-md-0 mt-3 theme-btn">
//              <Button>Next</Button> 
//              </div>    
//         </InlineStack> */}
//       </Box>
//     </Box>
//     </Page>
//   )
// }

// Product Creation Screen 
// import React, { useEffect, useState } from "react";
// import {
//   Text,
//   Box,
//   Page,
//   Image,
//   InlineStack,
//   Button
// } from "@shopify/polaris";
// import DonateWelcomeImage from '../assets/images/Donate-Welcome-Image.png';
// import userlogo from '../assets/images/user-image.png';
// import marklogo from '../assets/images/Mask group.png';

// export default function Welcome() {

//   return (
//     <Page fullWidth>
       
//     <Box>
     
//       {/* <Box
//               border="dashed"
//               padding="200"
//               display="flex"
//               flexDirection="column"
//               alignItems="center"
//               justifyContent="center"
//               gap="200"
//             >
              
//               <Image
//                 source="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
//                 alt="Donation Illustration"
//                 width={180}
//               />
//             </Box> */}
//              {/* <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginTop: '2rem',
//             padding: '2rem',
//           }}>
           
//              <Image
//                 source="https://cdn-icons-png.flaticon.com/512/1170/1170576.png"
//                 alt="Donation Illustration"
//                 width={180}
//               />
//           </div> */}
                  
//                   {/* <Image source={DonateWelcomeImage} alt="Donateme Logo" width={200} /> */}

                  
      
//       <div
//       style={{
//         display: 'flex',
//         justifyContent: 'center', 
//         flexDirection: 'column', 
//         alignItems: 'center',      
//         height: '50vh',           
//         width: '100%',             
//       }}
//     >
//       <Text as="h2" variant="headingLg">Product Created Successfully!</Text>
//       <Image source={marklogo} alt="Donateme Logo" width={80} />
//       <Text as="h2" variant="headingMd">Click Next to continue</Text>
//       </div>
      
    
                
     
//     </Box>
//     </Page>
//   )
// }

// Thank You for Installing DonateMe!
import {
  Text,
  Box,
  Page,
  Image,
} from "@shopify/polaris";
// import marklogo from '../assets/images/Mask group.png';
import gifticon from '../assets/images/Gift-Icon.png';

export default function Welcome() {

  return (
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
      <Text as="p" variant="bodyMd" alignment="center">Click Finish to complete the onboarding process.<br />You can restart onboarding anytime by navigating to DonateMe &gt; Settings &gt; Restart Onboarding.</Text>
      </div>
      
    
                
     
    </Box>
    </Page>
  )
}
