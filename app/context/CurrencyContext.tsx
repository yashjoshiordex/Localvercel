import React, { createContext, useContext, useState } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
});

// Generate the provider here and not in a separate file
export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState<string>("USD");
  
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook so we only need to import this rather than importing both CurrencyContext and useContext
export default function useCurrency() {
  return useContext(CurrencyContext);
}
