document.addEventListener("DOMContentLoaded", () => {
  // This script runs on all pages to manage login state and nav links

  // --- Part 1: Handle Active Navigation Link ---
  const navLinks = document.querySelectorAll(".main-nav .nav-link");
  const currentPageUrl = window.location.pathname;

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPageUrl) {
      if (window.location.search === "" && link.href.indexOf("?") === -1) {
        link.classList.add("active");
      } else if (window.location.search === new URL(link.href).search) {
        link.classList.add("active");
      }
    }
  });

  // --- Part 2: Handle Login State ---
  const userAccountLink = document.getElementById("user-account-link");
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (userAccountLink) {
    if (isLoggedIn) {
      userAccountLink.href = "account.html";
    } else {
      userAccountLink.href = "index.html"; // Points to new login page
    }
  }

  // --- Signup Logic ---
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      if (name && email) {
        const user = { name, email };
        localStorage.setItem("bookstoreUser", JSON.stringify(user));
        alert("Signup successful! Please log in.");
        window.location.href = "index.html"; // Redirect to new login page
      }
    });
  }

  // --- Login Logic ---
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("email").value;
      const storedUser = JSON.parse(localStorage.getItem("bookstoreUser"));

      if (storedUser && storedUser.email === emailInput) {
        sessionStorage.setItem("isLoggedIn", "true");
        window.location.href = "store.html"; // Redirect to the store on success
      } else if (emailInput) {
        sessionStorage.setItem("isLoggedIn", "true");
        localStorage.setItem(
          "bookstoreUser",
          JSON.stringify({ name: "Guest User", email: emailInput })
        );
        window.location.href = "store.html"; // Redirect to the store on success
      } else {
        alert(
          "User not found or email is incorrect. Please sign up or try again."
        );
      }
    });
  }
});
