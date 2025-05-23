// auth.js

const authForm = document.getElementById("authForm");
const formTitle = document.getElementById("formTitle");
const toggleLink = document.getElementById("toggleLink");
const toggleText = document.getElementById("toggleText");
const submitBtn = document.getElementById("submitBtn");
const nameField = document.getElementById("nameField");
const confirmField = document.getElementById("confirmField");

const loginMenuItem = document.getElementById("loginMenuItem");
const profileMenu = document.getElementById("profileMenu");
const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");

console.log("the auth.js file is loaded", localStorage);

const token = localStorage.authToken;
  if (token) {
    showProfileUI('P');
  }

let isLogin = true;

// Show/hide dropdown
if (profileIcon) {
  profileIcon.addEventListener("click", () => {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  });
}

// Logout functionality
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    window.location.href = "/views/login.html";
  });
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;

  let name, confirm;
  if (!isLogin) {
    name = document.getElementById("name").value.trim();
    confirm = document.getElementById("confirmPassword").value;

    if (!name) return alert("Please enter your name.");
    if (password !== confirm) return alert("Passwords do not match.");
  }

  const payload = isLogin
    ? { user_email: email, user_password: password }
    : { user_name: name, user_email: email, user_password: password };

  const url = isLogin
    ? "http://localhost:3000/api/auth/login"
    : "http://localhost:3000/api/auth/register";

  submitBtn.disabled = true;
  submitBtn.textContent = isLogin ? "Signing In…" : "Signing Up…";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Unknown error");

    alert(data.message || "Success!");

    // Store token & user name
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }
    if (data.user_name) {
      localStorage.setItem("userName", data.user_name);
    }

    console.log(localStorage, "hello, this is local storage");

    showProfileUI(data.user_name || name || "U" || data.token);

    // Redirect to landing page
    // window.location.href = "/index.html";

    authForm.reset();
    if (!isLogin) toggleLink.click();
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isLogin ? "Sign In" : "Sign Up";
  }
});

function showProfileUI(name = "U") {
  loginMenuItem.style.display = "none";
  profileMenu.style.display = "inline-block";
  profileIcon.textContent = name[0].toUpperCase();
}


// On page load
() => (function () {
  const token = localStorage.getItem("authToken");
  const userName = localStorage.getItem("userName");
  console.log(toke, userName, "this is the token and user name");
  if (token && userName) {
    showProfileUI(userName);
  }
})();
