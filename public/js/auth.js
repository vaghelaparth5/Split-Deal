// auth.js - Complete Version with Error Message Handling

// DOM Elements
const authForm = document.getElementById("authForm");
const formTitle = document.getElementById("formTitle");
const toggleLink = document.getElementById("toggleLink");
const toggleText = document.getElementById("toggleText");
const submitBtn = document.getElementById("submitBtn");
const nameField = document.getElementById("nameField");
const confirmField = document.getElementById("confirmField");
const errorMessage = document.getElementById("errorMessage");

const loginMenuItem = document.getElementById("loginMenuItem");
const profileMenu = document.getElementById("profileMenu");
const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");

console.log("[DEBUG] Auth.js initialized. Checking localStorage...");

// Helper to show error
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = "block";
}

// Helper to clear error
function clearError() {
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

// Clear error when user starts typing any input
[...document.querySelectorAll("#authForm input")].forEach(input => {
  input.addEventListener("input", () => {
    if (errorMessage.style.display === "block") {
      clearError();
    }
  });
});

// Toggle between login/signup
let isLogin = true;
toggleLink.addEventListener("click", () => {
  isLogin = !isLogin;

  formTitle.textContent = isLogin ? "Sign In" : "Sign Up";
  submitBtn.textContent = isLogin ? "Sign In" : "Sign Up";
  toggleText.textContent = isLogin 
    ? "Don't have an account?" 
    : "Already have an account?";
  toggleLink.textContent = isLogin ? "Sign Up" : "Sign In";

  nameField.style.display = isLogin ? "none" : "block";
  confirmField.style.display = isLogin ? "none" : "block";

  authForm.reset();
  clearError();
});

// Profile dropdown toggle
if (profileIcon) {
  profileIcon.addEventListener("click", () => {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  });
}

// Logout functionality
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    console.log("[DEBUG] Logging out. Clearing localStorage...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    window.location.href = "/views/login.html";
  });
}

// Form submission handler
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("[DEBUG] Form submitted. Mode:", isLogin ? "Login" : "Register");

  clearError();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;

  if (!email || !password) {
    showError("Please enter all required fields.");
    return;
  }

  let name, confirm;
  if (!isLogin) {
    name = document.getElementById("name").value.trim();
    confirm = document.getElementById("confirmPassword").value;

    if (!name || !confirm) {
      showError("Please enter all required fields.");
      return;
    }

    if (password !== confirm) {
      showError("Passwords do not match.");
      return;
    }
  }

  const payload = isLogin
    ? { user_email: email, user_password: password }
    : { user_name: name, user_email: email, user_password: password };

  const url = isLogin
    ? "http://localhost:3000/api/auth/login"
    : "http://localhost:3000/api/auth/register";

  submitBtn.disabled = true;
  submitBtn.textContent = isLogin ? "Signing In..." : "Signing Up...";

  try {
    console.log("[DEBUG] Sending request to:", url);
    console.log("[DEBUG] Payload:", payload);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("[DEBUG] Server response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Unknown error occurred");
    }

    if (data.token) {
      localStorage.setItem("authToken", data.token);
      console.log("[DEBUG] Auth token stored in localStorage");
    } else {
      console.warn("[DEBUG] No token received in response");
    }

    const receivedUsername = data.user_name || data.username || data.name;
    if (receivedUsername) {
      localStorage.setItem("userName", receivedUsername);
      console.log("[DEBUG] Username stored:", receivedUsername);
    } else {
      console.warn("[DEBUG] No username received in response. Available fields:", Object.keys(data));
    }

    alert(data.message || (isLogin ? "Login successful!" : "Registration successful!"));
    showProfileUI(receivedUsername || name || "U");

    if (isLogin) {
      window.location.href = "/index.html";
    } else {
      authForm.reset();
      toggleLink.click(); // Switch back to login view
    }

  } catch (err) {
    console.error("[ERROR] Authentication failed:", err);
    showError(`Error: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isLogin ? "Sign In" : "Sign Up";
  }
});

// UI Update Function
function showProfileUI(name = "U") {
  console.log("[DEBUG] Updating UI for user:", name);
  if (loginMenuItem) loginMenuItem.style.display = "none";
  if (profileMenu) profileMenu.style.display = "inline-block";
  if (profileIcon) {
    const displayChar = name[0]?.toUpperCase() || "U";
    profileIcon.textContent = displayChar;
    console.log("[DEBUG] Profile icon set to:", displayChar);
  }
}

// Initial Auth Check
(function initAuthCheck() {
  console.log("[DEBUG] Running initial auth check...");
  const token = localStorage.getItem("authToken");
  const userName = localStorage.getItem("userName");

  console.log("[DEBUG] Retrieved from localStorage:", { token, userName });

  if (token && userName) {
    console.log("[DEBUG] Valid session found for user:", userName);
    showProfileUI(userName);
  } else {
    console.log("[DEBUG] No active session found");
    if (token) console.warn("[DEBUG] Token exists but no username");
    if (userName) console.warn("[DEBUG] Username exists but no token");
  }
})();
