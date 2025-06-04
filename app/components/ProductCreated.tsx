import React, { useState } from "react";
import {
  Text,
  Box,
  Image
} from "@shopify/polaris";
import Right from "../assets/images/right.png"

export default function Productcreated() {
  return (
    <div>
      <Box>
        <div className="contain-center">
          <Image source={Right}
            alt="DonateMe Logo"
          />
        </div>
        <Box>
          <div className="text-center">
            <Text variant="bodyMd" as="p" fontWeight="bold">Product created Sucessfully!</Text>
          </div>
          <div className="text-center">
            <Text variant="bodyMd" as="p">Click Next to continue</Text>
          </div>
        </Box>
      </Box>
      {/* condtionally display components */}
      {/* <Product/> */}
    </div>

  );
}