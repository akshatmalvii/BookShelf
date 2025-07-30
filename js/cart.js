document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartSummaryContainer = document.getElementById("cart-summary");
  const cartCountElement = document.querySelector(".cart-count");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
  }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<div class="empty-cart-message"><h3>Your cart is empty.</h3><p>Looks like you haven\'t added any books yet.</p><a href="store.html" class="auth-btn" style="margin-top: 20px; display: inline-block;">Start Shopping</a></div>';
      cartSummaryContainer.innerHTML = "";
      return;
    }

    renderCartItems();
    renderCartSummary();
  }

  function renderCartItems() {
    cartItemsContainer.innerHTML = "";
    cart.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("cart-item");
      itemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.coverImage}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.title}</h3>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" data-id="${
                          item.id
                        }" data-action="decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-id="${
                          item.id
                        }" data-action="increase">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${
                      item.id
                    }">Remove</button>
                </div>
            `;
      cartItemsContainer.appendChild(itemElement);
    });
  }

  function renderCartSummary() {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 50.0; // Flat rate shipping
    const total = subtotal + shipping;

    cartSummaryContainer.innerHTML = `
            <h2>Order Summary</h2>
            <div class="summary-line">
                <span>Subtotal</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Shipping</span>
                <span>₹${shipping.toFixed(2)}</span>
            </div>
            <div class="summary-line total">
                <span>Total</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
            <a href="checkout.html" class="checkout-btn">Proceed to Checkout</a>
        `;
  }

  cartItemsContainer.addEventListener("click", (e) => {
    const target = e.target;
    const id = parseInt(target.dataset.id);

    if (target.classList.contains("quantity-btn")) {
      const action = target.dataset.action;
      const item = cart.find((i) => i.id === id);
      if (item) {
        if (action === "increase") {
          item.quantity++;
        } else if (action === "decrease" && item.quantity > 1) {
          item.quantity--;
        }
        saveCart();
      }
    }

    if (target.classList.contains("remove-item-btn")) {
      cart = cart.filter((i) => i.id !== id);
      saveCart();
    }
  });

  // Initial render
  updateCartCount();
  renderCart();
});
