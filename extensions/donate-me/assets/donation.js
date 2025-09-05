document.addEventListener("DOMContentLoaded", () => {
  // Helper function to format currency display
  const formatCurrency = (amount, symbol) => {
    const num = parseFloat(amount);
    const intPart = Math.floor(num);
    const decimalPart = num - intPart;
    
    if (decimalPart === 0) {
      // If it's a whole number, don't show decimals
      return symbol + ' ' + intPart;
    } else {
      // If it has decimals, show them (up to 2 decimal places, remove trailing zeros)
      return symbol + ' ' + num.toFixed(2).replace(/\.?0+$/, '');
    }
  };

  // Helper function to format amount without symbol (for input values)
  const formatAmountOnly = (amount) => {
    const num = parseFloat(amount);
    const intPart = Math.floor(num);
    const decimalPart = num - intPart;
    
    if (decimalPart === 0) {
      // If it's a whole number, return integer
      return intPart.toString();
    } else {
      // If it has decimals, return formatted decimal
      return num.toFixed(2).replace(/\.?0+$/, '');
    }
  };

  // Helper function to show loading state
  const showLoading = (button) => {
    const originalText = button.textContent;
    button.dataset.originalText = originalText;
    button.innerHTML = 'Processing...';
    button.disabled = true;
    button.style.cursor = 'not-allowed';
  };

  // Helper function to hide loading state
  const hideLoading = (button) => {
    const originalText = button.dataset.originalText || 'Donate';
    button.innerHTML = originalText;
    button.disabled = false;
    button.style.cursor = 'pointer';
  };

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

  // ✅ Format preset buttons on page load
  const formatPresetButtons = () => {
    const presetButtons = document.querySelectorAll('.preset-button[data-amount]:not([data-amount="other"])');
    
    presetButtons.forEach(button => {
      const amount = button.getAttribute('data-amount');
      if (amount && amount !== 'other') {
        button.textContent = formatCurrency(amount, currencySymbol);
      }
    });
  };

  // Format buttons after DOM is ready
  formatPresetButtons();

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
        const widget = document.getElementById('donation-widget');
        const removeBrandingSetting = widget?.dataset?.removeBranding === 'true';
        
        // Only hide branding if BOTH conditions are true:
        // 1. permissionResult is true (has permission)
        // 2. remove_branding setting is enabled
        if (data.permissionResult === true && removeBrandingSetting) {
          // Hide branding - user has permission AND setting is enabled
          const style = document.createElement('style');
          style.textContent = `
            .donation-widget::after {
              display: none !important;
            }
          `;
          document.head.appendChild(style);
          console.log('Branding hidden - permission granted and setting enabled');
        } else {
          // Show branding in ALL other cases:
          // - permissionResult: false (no permission)
          // - permissionResult: true but setting disabled
          // - API error or no response
          console.log('Branding shown - default behavior');
        }
        
        return data;
      } else {
        console.error('Failed to get store plan:', data);
        // Show branding on API error
        return null;
      }
    } catch (error) {
      console.error('Error fetching store plan:', error);
      // Show branding on error
      return null;
    }
  };

  // ✅ Initialize store plan data on page load
  let storePlanData = null;
  getStorePlan().then(data => {
    storePlanData = data;
    // You can use the store plan data here
    if (storePlanData) {
      console.log('Store plan loaded:', storePlanData);
    }
  });

  const donateForm = document.getElementById("donate-form");
  if (!donateForm) return;

  const input = donateForm.querySelector("#donation-amount") || donateForm.querySelector("#donation-amount-direct");
  const productId = donateForm.dataset.productId;

  // ✅ Handle preset buttons - active state management
  const presetButtons = document.querySelectorAll(".preset-button");
  if (presetButtons.length > 0) {
    presetButtons.forEach(button => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        presetButtons.forEach(btn => btn.classList.remove("active"));

        // Add active to the clicked button
        this.classList.add("active");

        const amount = this.dataset.amount;
        const inputContainer = document.getElementById('donation-input-container');

        if (amount === "other") {
          // Show input container when "Other" is clicked
          if (inputContainer) {
            inputContainer.classList.remove('hidden');
            if (input) {
              input.focus();
            }
          }
        } else {
          // Hide input container for preset amounts
          if (inputContainer) {
            inputContainer.classList.add('hidden');
          }
          // Set the preset amount value (formatted without decimals if whole number)
          if (input) {
            input.value = formatAmountOnly(amount);
          }
        }
      });
    });
  }

  // ✅ Handle "Other" button functionality
  const otherBtn = document.getElementById("other-button");
  const donationInput = document.getElementById("donation-amount");
  const currencyDisplay = document.getElementById("donationCurrency");

  if (otherBtn && donationInput) {
    otherBtn.addEventListener("click", function () {
      // Show input
      donationInput.style.display = "inline-block";
      donationInput.focus();

      // Show currency symbol
      if (currencyDisplay) {
        currencyDisplay.style.display = "inline-block";
      }
    });
  }

  // Handle input field changes
  if (input) {
    input.addEventListener('input', function() {
      // Remove active class from preset buttons when user types
      presetButtons.forEach(btn => btn.classList.remove('active'));
      // Keep "Other" button active if it exists
      const otherButton = document.getElementById('other-button');
      if (otherButton) {
        otherButton.classList.add('active');
      }
    });
  }

  // ✅ Single donation handler function
  const handleDonation = async (button) => {
    // Prevent multiple clicks
    if (button.disabled) return;

    // Check store plan before processing donation (optional)
    if (!storePlanData) {
      console.log('Store plan data not available');
      // You can still proceed or wait for the data
    }

    // Get amount from either input field
    const amountInput = document.getElementById('donation-amount') || document.getElementById('donation-amount-direct');
    const amount = amountInput?.value;
    
    const widget = document.getElementById('donation-widget');
    const productId = widget?.dataset?.productId;
    const apiEndpoint = widget?.dataset?.apiEndpoint || '/apps/donation/create-variant';
    const minimumDonation = widget?.dataset?.minimumDonation;
    
    console.log('Amount:', amount);
    console.log('Minimum Donation:', minimumDonation);
    
    const amountCheck = parseFloat(amount || '0');
    const minDonation = parseFloat(minimumDonation || '0');

    // Check if amount is less than minimum donation
    if (amountCheck < minDonation && minDonation > 0) {
      // Check if amount is valid
      const errorElement = document.getElementById('donation-error');
      if (!amount || isNaN(amount) || amountCheck <= 0) {
        errorElement.textContent = `Please enter donation amount`;
        errorElement.style.display = 'block';
        return;
      }
      if (errorElement) {
        errorElement.textContent = `You cannot donate less than ${formatCurrency(minDonation, currencySymbol)}`;
        errorElement.style.display = 'block';
      }
      return;
    }

    // Clear error if validation passes
    const errorElement = document.getElementById('donation-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }

    try {
      showLoading(button);

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, price: amount }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Invalid JSON:", text);
        console.log("Unexpected server response.");
        return;
      }

      if (res.ok && data.variantId) {
        const variantId = data.variantId?.split?.('/')?.pop() || data.variantId;

        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: parseInt(variantId), quantity: 1 }] }),
        });

        window.location.href = '/cart';
      } else {
        console.log('Failed to create donation variant.');
        console.error(data.errors || data.error);
      }
    } catch (err) {
      console.error(err);
      console.log('Error occurred. Please try again.');
    } finally {
      hideLoading(button);
    }
  };

  // ✅ Only handle donate button click (remove form submit listener)
  document.getElementById('donate-btn')?.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    await handleDonation(e.target);
  });

  function sanitizeNumericInput(e) {
    // Remove all except digits and one decimal point
    let value = e.target.value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    e.target.value = value;
  }

  // Prevent typing of +, -, e, E, etc.
  function blockInvalidKeys(e) {
    if (
      ['e', 'E', '+', '-', ','].includes(e.key)
    ) {
      e.preventDefault();
    }
  }

  const donationAmount = document.getElementById('donation-amount');
  const donationAmountDirect = document.getElementById('donation-amount-direct');
  if (donationAmount) {
    donationAmount.addEventListener('input', sanitizeNumericInput);
    donationAmount.addEventListener('keydown', blockInvalidKeys);
  }
  if (donationAmountDirect) {
    donationAmountDirect.addEventListener('input', sanitizeNumericInput);
    donationAmountDirect.addEventListener('keydown', blockInvalidKeys);
  }
});
