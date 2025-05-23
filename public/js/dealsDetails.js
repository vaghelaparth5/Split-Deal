let deals = []; // Will be populated from API

const dealGrid = document.getElementById("dealGrid");
const brandFilter = document.getElementById("brandFilter");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("createGroupModal");
const closeBtn = document.querySelector(".close");
const dealForm = document.getElementById("dealForm");

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
        alert('Group deal created successfully!');
        fetchGroups(); // Refresh the groups list
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

  filteredDeals.forEach((deal) => {
    const card = document.createElement("div");
    card.className = "deal-card";
    card.innerHTML = `
      <img src="${deal.image_url || "https://via.placeholder.com/150"}" alt="${
      deal.title
    }" />
      <h3>${deal.title}</h3>
      <p>${deal.description || ""}</p>
      <p>${deal.location || "Location not specified"}</p>
      <p><strong>Price:</strong> $${deal.price} <s>$${
      deal.original_price
    }</s></p>
      <p><strong>Expiry:</strong> ${new Date(
        deal.deadline
      ).toLocaleDateString()}</p>
      <button class="create-deal-btn">Create Group 🚀</button>
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
    deals = data.deals || [];
    applyFilters(); // Apply current filters after fetching
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    if (dealGrid) {
      dealGrid.innerHTML = "<p>Error loading deals.</p>";
    }
  }
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

module.exports = {
  deals,
  openModal,
  closeModal,
  dealForm, // Exporting elements initialized at top level
  dealGrid,
  brandFilter,
  searchInput,
  modal,
  closeBtn,
  renderDeals,
  applyFilters,
  fetchDeals,
  add, // If you keep this function
};
