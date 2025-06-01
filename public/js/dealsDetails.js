let deals = []; // Will be populated from API

const dealGrid = document.getElementById("dealGrid");
const brandFilter = document.getElementById("brandFilter");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("createGroupModal");
const closeBtn = document.querySelector(".close");
const dealForm = document.getElementById("dealForm");

const loginMenuItem = document.getElementById("loginMenuItem");
const profileMenu = document.getElementById("profileMenu");
const profileIcon = document.getElementById("profileIcon");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");

const token = localStorage.authToken;
  if (token) {
    showProfileUI('P');
  }

  function showProfileUI(name = "U") {
  loginMenuItem.style.display = "none";
  profileMenu.style.display = "inline-block";
  profileIcon.textContent = name[0].toUpperCase();
}

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

// Update the openGroupModal function
// Function to open group creation modal
function openModal(dealData) {
  // Pre-fill fields if coming from a deal
  if (dealData) {
    document.getElementById('dealId').value = dealData._id || '';
    document.getElementById('dealTitle').value = dealData.title || '';
    document.getElementById('dealDescription').value = dealData.description || '';
    document.getElementById('totalValue').value = dealData.price || '';
    document.getElementById('discount').value = 
      Math.round(((dealData.original_price - dealData.price) / dealData.original_price) * 100) || '';
    document.getElementById('expiryDate').value = 
      dealData.deadline ? new Date(dealData.deadline).toISOString().slice(0, 16) : '';
    document.getElementById('membersRequired').value = dealData.max_participants || 5;
    document.getElementById('dealLogo').value = dealData.image_url || '';
  }
  
  modal.style.display = 'block';
}

// Form submission handler
if (document.getElementById('groupForm')) {
  document.getElementById('groupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      dealId: document.getElementById('dealId').value,
      dealLogo: document.getElementById('dealLogo').value,
      dealTitle: document.getElementById('dealTitle').value,
      dealDescription: document.getElementById('dealDescription').value,
      storeName: document.getElementById('storeName').value,
      storeLocation: document.getElementById('storeLocation').value,
      totalValue: parseFloat(document.getElementById('totalValue').value),
      discount: parseFloat(document.getElementById('discount').value),
      expiryDate: document.getElementById('expiryDate').value,
      membersRequired: parseInt(document.getElementById('membersRequired').value),
      receiptImage: document.getElementById('receiptImage').value,
      status: "active" // Default status
    };

    try {
      const response = await fetch('http://localhost:3000/api/group/create-group', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        closeModal();
        showGroupCreationNotification();
        // alert('Group deal created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert(`Failed to create group: ${errorData.message || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    }
  });
}



// Function to close modal
function closeModal() {
  modal.style.display = "none";
  // formData.reset();
}

// Event listeners for modal
if (closeBtn) {
  closeBtn.addEventListener("click", closeModal);
}

if (modal) {
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}


function renderDeals(filteredDeals) {
  if (!dealGrid) return;

  dealGrid.innerHTML = "";

  if (filteredDeals.length === 0) {
    dealGrid.innerHTML = "<p>No deals found.</p>";
    return;
  }

  // filteredDeals.forEach((deal) => {
  //   const card = document.createElement("div");
  //   card.className = "deal-card";
  //   card.innerHTML = `
  //     <img src="${deal.image_url || "https://via.placeholder.com/150"}" alt="${
  //     deal.title
  //   }" />
  //     <h3>${deal.title}</h3>
  //     <p>${deal.description || ""}</p>
  //     <p>${deal.location || "Location not specified"}</p>
  //     <p><strong>Price:</strong> $${deal.price} <s>$${
  //     deal.original_price
  //   }</s></p>
  //     <p><strong>Expiry:</strong> ${new Date(
  //       deal.deadline
  //     ).toLocaleDateString()}</p>
  //     <button class="create-deal-btn">Create Group 🚀</button>
  //   `;
  //   dealGrid.appendChild(card);

  //   const button = card.querySelector(".create-deal-btn");
  //   button.addEventListener("click", () => openModal(deal));
  // });

  filteredDeals.forEach((deal) => {
    const card = document.createElement("div");
    card.className = "deal-card";
    
    // Add expired class if deal is expired
    if (new Date(deal.deadline) < new Date()) {
        card.classList.add("expired");
    }
    
    card.innerHTML = `
      ${deal.weekend_only ? '<span class="weekend-tag">Weekend Only</span>' : ''}
      <img src="${deal.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}" alt="${deal.title}" />
      <div class="card-content">
        <h3>${deal.title}</h3>
        <p>${deal.description || ''}</p>
        
        <div class="deal-meta">
          <p class="location">${deal.location || 'Location not specified'}</p>
          <p><span class="price">$${deal.price}</span> <span class="original-price"><s>$${deal.original_price}</s></span></p>
          <p class="expiry">${new Date(deal.deadline).toLocaleDateString()}</p>
        </div>
        
        <button class="create-deal-btn">
          <span>Create Group</span>
          <span>🚀</span>
        </button>
      </div>
    `;
    
    dealGrid.appendChild(card);

    const button = card.querySelector(".create-deal-btn");
    button.addEventListener("click", () => openModal(deal));
});
}

function applyFilters() {
  const selectedBrand = brandFilter ? brandFilter.value.toLowerCase() : "all";
  const searchText = searchInput ? searchInput.value.toLowerCase() : "";

  const filtered = deals.filter((deal) => {
    const brandMatch =
      selectedBrand === "all" ||
      (deal.brand && deal.brand.toLowerCase().includes(selectedBrand)) ||
      (deal.title && deal.title.toLowerCase().includes(selectedBrand));

    const textMatch =
      searchText === "" ||
      (deal.title && deal.title.toLowerCase().includes(searchText)) ||
      (deal.description &&
        deal.description.toLowerCase().includes(searchText)) ||
      (deal.category && deal.category.toLowerCase().includes(searchText));

    return brandMatch && textMatch;
  });

  renderDeals(filtered);
}

async function fetchDeals() {
  try {
    const response = await fetch("http://localhost:3000/api/deal/get");
    const data = await response.json();
    deals = data;
    // Populate the brand filter dropdown dynamically
    populateBrandFilter();
    applyFilters(); // Apply current filters after fetching
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    if (dealGrid) {
      dealGrid.innerHTML = "<p>Error loading deals.</p>";
    }
  }
}

function populateBrandFilter() {
  if (!brandFilter) return;

  // Get all unique first words from deal titles
  const uniqueBrands = new Set();
  
  deals.forEach(deal => {
    if (deal.title) {
      // Get the first word of the title
      const firstWord = deal.title.trim().split(/\s+/)[0];
      if (firstWord) {
        uniqueBrands.add(firstWord);
      }
    }
    
    // Also include the brand if it exists in the deal object
    if (deal.brand) {
      uniqueBrands.add(deal.brand);
    }
  });

  // Clear existing options except the first one ("All Brands")
  brandFilter.innerHTML = '<option value="All">All Brands</option>';
  
  // Add new options sorted alphabetically
  const sortedBrands = Array.from(uniqueBrands).sort();
  sortedBrands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
  });
}

// Initialize event listeners
if (brandFilter && searchInput) {
  brandFilter.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", applyFilters);

  // Initial fetch
  fetchDeals();
}

// math.js
function add(a, b) {
  return a + b;
}

// Function to show the notification
function showGroupCreationNotification() {
  const notification = document.getElementById('groupCreationNotification');
  const viewGroupBtn = document.getElementById('viewGroupBtn');
  
  // Set up the button to navigate to the group page
  viewGroupBtn.addEventListener('click', () => {
    window.location.href = `/views/grouplisting.html`; // Adjust this URL to your actual group page route
  });
  
  // Show the notification
  notification.classList.add('show');
  
  // Auto-hide after 5 seconds (optional)
  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Remove the hide class after animation completes
    setTimeout(() => {
      notification.classList.remove('hide');
    }, 500);
  }, 5000);
}

document.getElementById('subscribeForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('subscribeEmail');
  const messageElement = document.getElementById('subscriptionMessage');
  const email = emailInput.value.trim();
  
  // Reset message
  messageElement.textContent = '';
  messageElement.className = 'subscription-message';
  
  // Validate email
  if (!validateEmail(email)) {
    messageElement.textContent = 'Please enter a valid email address';
    messageElement.classList.add('error');
    return;
  }
  
  // Simulate sending email (in a real app, you would make an API call here)
  simulateEmailSend(email)
    .then(() => {
      messageElement.textContent = 'Thank you for subscribing! You will receive updates on upcoming deals.';
      messageElement.classList.add('success');
      emailInput.value = ''; // Clear the input
      
      // Reset message after 5 seconds
      setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'subscription-message';
      }, 5000);
    })
    .catch(error => {
      messageElement.textContent = 'Something went wrong. Please try again later.';
      messageElement.classList.add('error');
      console.error('Subscription error:', error);
    });
});

// Email validation function
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Simulate email sending (replace with actual API call in production)
function simulateEmailSend(email) {
  return new Promise((resolve) => {
    // In a real application, you would make an API call here
    console.log(`Email would be sent to: ${email}`);
    
    // Simulate network delay
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}


// module.exports = {
//   deals,
//   openModal,
//   closeModal,
//   dealForm, // Exporting elements initialized at top level
//   dealGrid,
//   brandFilter,
//   searchInput,
//   modal,
//   closeBtn,
//   renderDeals,
//   applyFilters,
//   fetchDeals,
//   add, // If you keep this function
// };
