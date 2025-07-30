document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".payment-content");
  const checkoutContainer = document.getElementById("checkout-container");
  const successMessage = document.getElementById("success-message");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Deactivate all tabs and content
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      // Activate the clicked tab and corresponding content
      tab.classList.add("active");
      document
        .getElementById(tab.dataset.tab + "-payment")
        .classList.add("active");
    });
  });

  function handleDummyPayment(event) {
    event.preventDefault(); // Prevent form submission

    // Clear the cart in localStorage
    localStorage.removeItem("cart");

    // Hide the checkout form and show the success message
    checkoutContainer.style.display = "none";
    successMessage.style.display = "block";
  }

  document
    .getElementById("pay-card-btn")
    .addEventListener("click", handleDummyPayment);
  document
    .getElementById("pay-upi-btn")
    .addEventListener("click", handleDummyPayment);
});
