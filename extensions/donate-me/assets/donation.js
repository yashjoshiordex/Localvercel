document.addEventListener("DOMContentLoaded", () => {
  const donateForm = document.getElementById("donate-form");
  if (!donateForm) return;

  const input = donateForm.querySelector("#donation-amount");
  const productId = donateForm.dataset.productId;

  // ✅ Handle preset buttons inside the form
  donateForm.querySelectorAll(".preset-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.amount;
    });
  });

  // ✅ Handle form submit
  donateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = input.value;

    try {

      const res = await fetch("/apps/donation/create-variant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId:productId, price: amount}),
      });

      console.log("Response status:", res);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Invalid JSON:", text);
        alert("Unexpected server response.");
        return;
      }

      if (res.ok && data.variantId) {
        const formData = new FormData();
        formData.append("id", data.variantId);
        formData.append("quantity", "1");
        formData.append("properties[Donation Amount]", amount);

        await fetch("/cart/add", {
          method: "POST",
          body: formData,
        });

        window.location.href = "/cart";
      } else {
        alert("Failed to create donation variant.");
        console.error(data.errors || data.error);
      }
    } catch (err) {
      console.error("Donation error:", err);
      alert("Something went wrong.");
    }
  });
});
