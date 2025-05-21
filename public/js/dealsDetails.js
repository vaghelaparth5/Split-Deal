const deals = [
  {
    brand: "Superdry",
    logo: "https://res.cloudinary.com/du5br7g8b/image/upload/v1743473069/dqp71qo4nv2a8wpmgta2.webp",
    title: "Superdry Winter Sale",
    location: "Convention Centre Pl, South Wharf",
    expiry: "April 25, 2025"
  },
  {
    brand: "Tommy Hilfiger",
    logo: "https://res.cloudinary.com/du5br7g8b/image/upload/v1742821088/e5sxqakk7aumxscyrvdz.png",
    title: "Buy 2 get 2 Hoodies Free",
    location: "Convention Centre Pl, South Wharf",
    expiry: "April 30, 2025"
  },
  {
    brand: "Zara",
    logo: "https://res.cloudinary.com/du5br7g8b/image/upload/v1742222953/hpukw5lmrnwijhoem2hb.webp",
    title: "Zara X Week",
    location: "Melbourne Bourke Street",
    expiry: "May 3, 2025"
  },
  {
    brand: "Nike",
    logo: "https://www.svgrepo.com/show/303173/nike-3-logo.svg",
    title: "Nike Air Max 20% Off + Free Shipping",
    location: "Melbourne Central",
    expiry: "May 10, 2025"
  },
  {
    brand: "Levi's",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Levi%27s_logo.svg/2560px-Levi%27s_logo.svg.png",
    title: "Levi's Denim Discount - 25% Off",
    location: "Bourke Street Mall",
    expiry: "May 15, 2025"
  }
];

const dealGrid = document.getElementById('dealGrid');
const brandFilter = document.getElementById('brandFilter');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('createDealModal');
const closeBtn = document.querySelector('.close');
const dealForm = document.getElementById('dealForm');

// Function to open modal with deal data
function openModal(dealData) {
  if (dealData) {
    // Pre-populate form with deal data if available
    document.getElementById('dealTitle').value = dealData.title || '';
    document.getElementById('dealDescription').value = `Get this exclusive deal on ${dealData.brand} products!`;
    document.getElementById('dealLocation').value = dealData.location || '';
    
    // Set a default deadline (7 days from now)
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);
    document.getElementById('dealDeadline').value = defaultDeadline.toISOString().slice(0, 16);
  }
  modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
  modal.style.display = 'none';
  dealForm.reset();
}

// Event listeners for modal
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Handle form submission
dealForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('dealTitle').value,
    description: document.getElementById('dealDescription').value,
    price: parseFloat(document.getElementById('dealPrice').value),
    original_price: parseFloat(document.getElementById('dealOriginalPrice').value),
    deadline: document.getElementById('dealDeadline').value,
    location: document.getElementById('dealLocation').value,
    max_participants: parseInt(document.getElementById('dealMaxParticipants').value),
    category: document.getElementById('dealCategory').value,
    image_url: document.getElementById('dealImage').value
  };

  try {
    const response = await fetch('/api/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Deal created successfully!');
      closeModal();
      // You might want to refresh the deals list here
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || 'Failed to create deal'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while creating the deal');
  }
});

function renderDeals(filteredDeals) {
  dealGrid.innerHTML = "";

  if (filteredDeals.length === 0) {
    dealGrid.innerHTML = "<p>No deals found.</p>";
    return;
  }

  filteredDeals.forEach(deal => {
    const card = document.createElement('div');
    card.className = 'deal-card';
    card.innerHTML = `
      <img src="${deal.logo}" alt="${deal.brand}" />
      <h3>${deal.title}</h3>
      <p>${deal.location}</p>
      <p><strong>Expiry:</strong> ${deal.expiry}</p>
      <button class="create-deal-btn">Create Deal 🚀</button>
    `;
    dealGrid.appendChild(card);
    
    // Add event listener to the button
    const button = card.querySelector('.create-deal-btn');
    button.addEventListener('click', () => openModal(deal));
  });
}

function applyFilters() {
  const selectedBrand = brandFilter.value.toLowerCase();
  const searchText = searchInput.value.toLowerCase();

  const filtered = deals.filter(deal => {
    const brandMatch = selectedBrand === "all" || deal.brand.toLowerCase() === selectedBrand;
    const textMatch =
      deal.brand.toLowerCase().includes(searchText) ||
      deal.title.toLowerCase().includes(searchText);
    return brandMatch && textMatch;
  });

  renderDeals(filtered);
}

// Initial render
renderDeals(deals);

// Event listeners
brandFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);
