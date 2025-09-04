

import React, { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Text,
  Button,
  Box,
  InlineStack,
  Image
} from "@shopify/polaris";
import Logo from "../../assets/images/donateMeDashboardLogo.svg";
import "../../css/style.css";
import Welcome from "app/components/Welcome";
import SelectPlanOnboarding from "app/components/SelectPlanOnboarding";
import Thankyou from "app/components/ThankYou";
import { useNavigate, useSearchParams } from "@remix-run/react";

// Stepper Component
const Stepper = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div style={{ textAlign: "center", marginBottom: "24px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "20px auto",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Background Line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "#e1e3e5",
            zIndex: 0,
            transform: "translateY(-50%)",
            borderRadius: 2,
          }}
        />
        {/* Filled Progress Line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${progressPercent}%`,
            height: 4,
            backgroundColor: "#6C8ED0",
            zIndex: 1,
            transform: "translateY(-50%)",
            borderRadius: 2,
            transition: "width 0.3s ease-in-out",
          }}
        />
        {/* Step Dots */}
        {dots.map((dot) => (
          <div
            key={dot}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: dot <= currentStep ? "#6C8ED0" : "#d3d3d3",
              zIndex: 2,
            }}
          />
        ))}
      </div>
      <Text as="p" variant="bodySm" tone="subdued">
        Step {currentStep} of {totalSteps}
      </Text>
    </div>
  );
};

export default function Onboarding() {
  const totalSteps = 3;
  const [step, setStep] = useState<number>(1);
  const [isClient, setIsClient] = useState<boolean>(false);

  const [searchParams] = useSearchParams();

const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
      const savedStep = parseInt(window.localStorage.getItem("step") || "1", 10);
      setStep(savedStep);
    }
  }, []);

const nextStep = (planId?: string) => {
  if (step < totalSteps) {
    const next = step + 1;
    setStep(next);
    
    // Store planId if provided (from free plan selection)
    if (planId) {
      setSelectedPlanId(planId);
    }
    
    if (isClient) {
      window.localStorage.setItem("step", next.toString());
      if (planId) {
        window.localStorage.setItem("selectedPlanId", planId);
      }
    }
  }
};

  const prevStep = () => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      if (isClient) {
        window.localStorage.setItem("step", prev.toString());
      }
    }
  };


const handleOnboard = async () => {
  try {
    await fetch(`/api/onboarding`, { method: "POST", credentials: "include" });

    navigate("/app/dashboard");
  } catch (error) {
    console.log("Error: ", error);
  } };

  const renderStep = () => {
    switch (step) {
      case 1: return <Welcome />;
      case 2: return <SelectPlanOnboarding nextStep={nextStep} />;
    case 3: 
      return (
        <Thankyou 
          planId={selectedPlanId || searchParams.get("plan")}
          chargeId={searchParams.get("charge_id")}
        />
      );
      default: return <Welcome />;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);

      const chargeId = searchParams.get("charge_id");
      const planId = searchParams.get("plan");
      const status = searchParams.get("status");

      if (chargeId && planId) {
        // Payment completed successfully
        setStep(3);
        window.localStorage.setItem("step", "3");
      } else if (status === "cancelled") {
        // Payment was cancelled, go back to plan selection
        setStep(2);
        window.localStorage.setItem("step", "2");
      } else {
        // Normal flow
        const savedStep = parseInt(window.localStorage.getItem("step") || "1", 10);
        setStep(savedStep);
      }
    }
  }, [searchParams]);

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Box background="bg-surface" padding="500" borderRadius="300">
            {/* Logo */}
            {step <= 3 && (
              <InlineStack align="start" blockAlign="center">
                <Image source={Logo} alt="Donateme Logo" width={150} />
              </InlineStack>
            )}

            {/* Stepper */}
            <Stepper currentStep={step} totalSteps={totalSteps} />

            {/* Content */}
            {renderStep()}

            <Box width="100%" paddingBlock="400" paddingInline="200">
              <div style={{
                display: 'flex',
                justifyContent: step === 1 || step === 3 ? 'flex-end' : 'space-between',
                alignItems: 'center',
                width: '100%'
              }}>
                {/* Left - Go Back Button - Only show on step 2 */}
                {step === 2 && (
                  <div className="mt-md-0 mt-3 grey-btn">
                    <Button onClick={prevStep}>
                      Go Back
                    </Button>
                  </div>
                )}

                {/* Right - Next/Finish Button */}
                {step !== 2 &&
                  <div className="mt-md-0 mt-3 theme-btn">

                    <Button
                      variant="primary"
                      onClick={step === totalSteps ? handleOnboard : nextStep}
                    >
                      {step === totalSteps ? "Finish" : "Next"}
                    </Button>
                  </div>
                }
              </div>
            </Box>



          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
