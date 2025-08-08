import React, { createContext, useContext, useState } from "react";

interface PlanContextType {
  plan: string;
  setPlan: React.Dispatch<React.SetStateAction<string>>;
}

export const PlanContext = createContext<PlanContextType>({
  plan: "Free Plan",
  setPlan: () => {},
});

// Generate the provider here and not in a separate file
export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [plan, setPlan] = useState<string>("Free Plan");
  
  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

// Custom hook so we only need to import this rather than importing both PlanContext and useContext
export default function usePlan() {
  return useContext(PlanContext);
}
