document.addEventListener("DOMContentLoaded", () => {
  const userDetailsContainer = document.getElementById("user-details");
  const orderHistoryContainer = document.getElementById(
    "order-history-container"
  );
  const logoutBtn = document.getElementById("logout-btn");
  const cartCountElement = document.querySelector(".cart-count");
  const addressForm = document.getElementById("address-form");
  const addressDisplay = document.getElementById("address-display");

  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    window.location.href = "index.html";
    return;
  }

  // --- Load User Details ---
  const user = JSON.parse(localStorage.getItem("bookstoreUser"));
  if (user && userDetailsContainer) {
    userDetailsContainer.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
        `;
  }

  // --- Address Logic ---
  function displayAddress() {
    const savedAddress = JSON.parse(localStorage.getItem("userAddress"));
    if (savedAddress) {
      addressDisplay.innerHTML = `
                <p>${savedAddress.addressLine}</p>
                <p>${savedAddress.city}, ${savedAddress.state} - ${savedAddress.pincode}</p>
            `;
      // Pre-fill form for editing
      document.getElementById("address-line").value = savedAddress.addressLine;
      document.getElementById("address-city").value = savedAddress.city;
      document.getElementById("address-state").value = savedAddress.state;
      document.getElementById("address-pincode").value = savedAddress.pincode;
    } else {
      addressDisplay.innerHTML = "<p>You have not saved an address yet.</p>";
    }
  }

  if (addressForm) {
    addressForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const address = {
        addressLine: document.getElementById("address-line").value,
        city: document.getElementById("address-city").value,
        state: document.getElementById("address-state").value,
        pincode: document.getElementById("address-pincode").value,
      };
      localStorage.setItem("userAddress", JSON.stringify(address));
      alert("Address saved successfully!");
      displayAddress();
    });
  }

  // --- Order History Logic ---
  async function fetchOrders() {
    try {
      const response = await fetch("data/dummy-orders.json");
      const orders = await response.json();
      displayOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      orderHistoryContainer.innerHTML = "<p>Could not load order history.</p>";
    }
  }

  function displayOrders(orders) {
    orderHistoryContainer.innerHTML = "";
    if (orders.length === 0) {
      orderHistoryContainer.innerHTML = "<p>You have no past orders.</p>";
      return;
    }
    orders.forEach((order) => {
      const orderCard = document.createElement("div");
      orderCard.classList.add("order-card");
      const itemsHtml = order.items
        .map((item) => `<li>${item.title} - ₹${item.price}</li>`)
        .join("");
      orderCard.innerHTML = `
                <div class="order-header">
                    <div>
                        <strong>Order ID:</strong> ${order.orderId}<br>
                        <strong>Date:</strong> ${order.date}
                    </div>
                    <span class="order-status ${order.status.toLowerCase()}">${
        order.status
      }</span>
                </div>
                <p><strong>Total: ${order.total}</strong></p>
                <p><strong>Items:</strong></p>
                <ul class="order-items-list">${itemsHtml}</ul>
            `;
      orderHistoryContainer.appendChild(orderCard);
    });
  }

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("isLoggedIn");
      window.location.href = "index.html";
    });
  }

  // --- Initial Calls ---
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
  }

  displayAddress();
  fetchOrders();
  updateCartCount();
});
