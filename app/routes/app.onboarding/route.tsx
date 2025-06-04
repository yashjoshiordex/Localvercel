

import React, { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Text,
  Button,
  ProgressBar,
  Box,
  InlineStack,
  Image
} from "@shopify/polaris";
import Logo from "../../assets/images/donate-img.png";
import "../../css/style.css";
import Welcome from "app/components/Welcome";
import References from "app/components/References";
import Thankyou from "app/components/ThankYou";
import SelectPlan from "app/components/SelectPlan";
import ProductOnborading from "app/components/ProductOnboarding";

export default function Onboarding() {
  const totalSteps = 6;
  const [step, setStep] = useState<number>(1);
  const [productCreated, setProductCreated] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
      const savedStep = parseInt(window.localStorage.getItem("step") || "1", 10);
      setStep(savedStep);
    }
  }, []);

  const nextStep = () => {
    if (step < totalSteps) {
      const next = step + 1;
      setStep(next);
      if (isClient) {
        window.localStorage.setItem("step", next.toString());
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

  const createProductCTA = () => {
    setProductCreated(true);
  };

  const progress = step === 1 ? 0 : (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1: return <Welcome />;
      case 2: return <ProductOnborading createProductCTA={createProductCTA} setProductCreated={setProductCreated} productCreated={productCreated} />;
      case 3: return <References />;
      case 4: return <SelectPlan nextStep={nextStep} />;
      default: return null;
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Box background="bg-surface" padding="500" borderRadius="300">
            {step <= 3 && (
              <div className="mb-3">
                <InlineStack align="center" blockAlign="center">
                  <Image source={Logo} alt="Donateme Logo" width={80} />
                </InlineStack>
              </div>
            )}

            {renderStep()}

            {(step <= 3 && !(step === 2 && !productCreated)) && (
              <Box paddingBlock="400">
                <div className="progress-container">
                  <div className="custom-progress">
                    <ProgressBar progress={progress} size="medium" />
                  </div>
                  <div className="mt-2 mb-3 text-center">
                    <Text as="p" variant="bodyMd">
                      Step {step} of {totalSteps}
                    </Text>
                  </div>
                  <InlineStack gap="200" align="center">
                    <Button disabled={step === 1} onClick={prevStep}>
                      Go Back
                    </Button>
                    <Button variant="primary" onClick={nextStep}>
                      Next
                    </Button>
                  </InlineStack>
                </div>
              </Box>
            )}
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
