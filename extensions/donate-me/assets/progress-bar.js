document.addEventListener("DOMContentLoaded", () => {
  // ✅ Function to get store plan data and control branding
  const getStorePlan = async () => {
    try {
      const response = await fetch('/apps/donation/app/getSubscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Store Plan Data:', data);
        
        // Control branding based on permissionResult
        const progressContainer = document.querySelector('.progress-bar-container');
        const removeBrandingSetting = progressContainer?.dataset?.removeBranding === 'true';
        
        // Only hide branding if BOTH conditions are true:
        // 1. permissionResult is true (has permission)
        // 2. remove_branding setting is enabled
        if (data.permissionResult === true && removeBrandingSetting) {
          // Hide branding - user has permission AND setting is enabled
          const style = document.createElement('style');
          style.textContent = `
            .progress-bar-container::after {
              display: none !important;
            }
          `;
          document.head.appendChild(style);
          console.log('Progress bar branding hidden - permission granted and setting enabled');
        } else {
          // Show branding in ALL other cases
          console.log('Progress bar branding shown - default behavior');
        }
        
        return data;
      } else {
        console.error('Failed to get store plan:', data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching store plan:', error);
      return null;
    }
  };

  // ✅ Initialize store plan data on page load
  let storePlanData = null;
  getStorePlan().then(data => {
    storePlanData = data;
    if (storePlanData) {
      console.log('Progress bar store plan loaded:', storePlanData);
    }
  });

  const progressContainer = document.querySelector(".progress-bar-container");
  const noProductMessage = document.querySelector(".no-product-message");
  
  // If no product message is shown, don't run progress bar logic at all
  if (noProductMessage) {
    console.log("No product selected - showing message only");
    return;
  }

  // Only proceed if we have a progress container (meaning a product is selected)
  if (!progressContainer) {
    console.log("Progress container not found");
    return;
  }

  const progressFill = document.getElementById("progress-bar-fill");
  const progressText = document.getElementById("progress-text");
  const currentSales = document.getElementById("current-sales");
  const goalTarget = document.getElementById("goal-target");
  
  const productId = progressContainer.dataset.productId;
  const apiEndpoint = progressContainer.dataset.apiEndpoint;

  console.log("Elements found:", {
    progressFill: !!progressFill,
    progressText: !!progressText,
    currentSales: !!currentSales,
    goalTarget: !!goalTarget,
    productId: productId,
    apiEndpoint: apiEndpoint
  });

  // Get currency symbol from the page
   const getCurrencySymbol = () => {
    // Try to get currency symbol from various sources
    const currencyFromElement = document.querySelector('#donationCurrency')?.textContent?.trim();
    const currencyFromSpan = document.querySelector('span[style*="font-weight: bold"]')?.textContent?.trim();
    const currencyFromWidget = document.querySelector('.currency-symbol')?.textContent?.trim();
    
    // Fallback to common symbols
    return currencyFromElement || currencyFromSpan || currencyFromWidget || '$';
  };

  const currencySymbol = getCurrencySymbol();

  // Function to update progress bar
  function updateProgressBar(current, goal) {
    console.log("updateProgressBar called with:", { current, goal, progressFill: !!progressFill });
    
    if (!progressFill || goal <= 0) {
      console.log("Early return - no progressFill or goal <= 0");
      return;
    }
    
    const percentage = Math.min((current / goal) * 100, 100);
    console.log("Calculated percentage:", percentage);
    
    // Only set the width, keeping the color from CSS
    progressFill.style.width = `${percentage}%`;
    
    console.log("Progress fill width updated to:", percentage + "%");
    
    if (progressText) {
      progressText.textContent = `${Math.round(percentage)}%`;
      console.log("Progress text updated:", progressText.textContent);
    }
    
    if (currentSales) {
      currentSales.innerHTML = `Raised: ${currencySymbol}${current.toLocaleString()}`;
    }
    
    if (goalTarget) {
      goalTarget.innerHTML = `Goal: ${currencySymbol}${goal.toLocaleString()}`;
    }
  }

  // Function to fetch donation data
  async function fetchDonationProgress() {
    if (!productId) {
      console.log("No product ID, cannot fetch data");
      return;
    }
    
    try {
      console.log("Fetching from:", `${apiEndpoint}/${encodeURIComponent(productId)}`);
      const response = await fetch(`${apiEndpoint}/${encodeURIComponent(productId)}`);
      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (response.ok) {
        const currentAmount = data?.availableSales || 0;
        const goalAmount = data?.goalAmount || 0;
        
        console.log("Amounts from API:", { currentAmount, goalAmount });
        updateProgressBar(currentAmount, goalAmount);
      } else {
        console.warn("Failed to fetch donation progress");
        // Show error in the UI
        if (currentSales) {
          currentSales.innerHTML = "Error loading data";
        }
        if (goalTarget) {
          goalTarget.innerHTML = "Please try again";
        }
      }
    } catch (error) {
      console.error("Error fetching donation progress:", error);
      // Show error in the UI
      if (currentSales) {
        currentSales.innerHTML = "Error loading data";
      }
      if (goalTarget) {
        goalTarget.innerHTML = "Please try again";
      }
    }
  }

  // Initialize progress bar with API data
  fetchDonationProgress();
});