console.log("mainSocket.js loaded");



window.onload = function () {
    console.log("working");

    const socket = io(); // ONLY ONE socket instance

    // CONNECTION
    socket.on("connect", () => {
        console.log(" Connected to server:", socket.id);
    });

    //  DEAL NOTIFICATION
    socket.on("new_deal", (data) => {
        console
        console.log(" [DEAL] new_deal received:", data);

        const popup = document.getElementById("deal-notification");
        const img = document.getElementById("deal-img");
        const title = document.getElementById("deal-title");
        const price = document.getElementById("deal-price");
        const location = document.getElementById("deal-location");
        const viewBtn = document.getElementById("view-deal-btn");
        const closeBtn = document.getElementById("close-notification");

        if (!popup || !img || !title || !price || !location || !viewBtn || !closeBtn) {
            console.warn(" Deal toast DOM elements missing");
            return;
        }

        // Set content from backend payload
        img.src = data.deal.image_url || "https://via.placeholder.com/60"; // fallback
        title.textContent = data.deal.title;
        price.textContent = `₹${data.deal.price} (was ₹${data.deal.original_price})`;
        location.textContent = data.deal.location ? ` ${data.deal.location}` : "";
        viewBtn.href = `/views/dealsDetails.html?id=${data.deal._id}`;

        popup.classList.add("show");

        const timer = setTimeout(() => {
            popup.classList.remove("show");
        }, 7000);

        closeBtn.onclick = () => {
            popup.classList.remove("show");
            clearTimeout(timer);
        };
    });


    //  GROUP NOTIFICATION
    socket.on("new_group", (data) => {
        console.log(" [GROUP] new_group received:", data);

        const popup = document.getElementById("group-notification");
        const title = document.getElementById("group-title");
        const members = document.getElementById("group-members");
        const joinBtn = document.getElementById("join-group-btn");
        const closeBtn = document.getElementById("close-group");

        if (!popup || !title || !members || !joinBtn || !closeBtn) {
            console.warn(" Group DOM elements not found");
            return;
        }

        title.textContent = data.group.dealTitle;
        members.textContent = `Members required: ${data.group.membersRequired}`;
        joinBtn.href = `/views/groupDetails.html?id=${data.group._id}`;

        popup.classList.add("show");

        const timer = setTimeout(() => {
            popup.classList.remove("show");
        }, 7000);

        closeBtn.onclick = () => {
            popup.classList.remove("show");
            clearTimeout(timer);
        };
    });

    // deal expire
    socket.on("deal_expired", (data) => {
        console.log(" [EXPIRED] deal_expired received:", data);

        const popup = document.getElementById("deal-notification");
        const img = document.getElementById("deal-img");
        const title = document.getElementById("deal-title");
        const price = document.getElementById("deal-price");
        const location = document.getElementById("deal-location");
        const viewBtn = document.getElementById("view-deal-btn");
        const closeBtn = document.getElementById("close-notification");

        if (!popup || !img || !title || !price || !location || !viewBtn || !closeBtn) {
            console.warn("Deal DOM elements missing");
            return;
        }

        img.src = data.deal.image_url || "https://via.placeholder.com/60";
        title.textContent = `Expired: ${data.deal.title}`;
        price.textContent = "";
        location.textContent = `Deadline was: ${new Date(data.deal.deadline).toLocaleString()}`;
        viewBtn.href = `/views/dealsDetails.html?id=${data.deal._id}`;
        viewBtn.textContent = "View Details";

        popup.classList.add("show");

        const timer = setTimeout(() => {
            popup.classList.remove("show");
        }, 7000);

        closeBtn.onclick = () => {
            popup.classList.remove("show");
            clearTimeout(timer);
        };
    });

    // Group Status Update Notification
    socket.on("group-status-updated", (data) => {
        console.log(" [GROUP] group-status-updated received:", data);

        const popup = document.getElementById("group-notification");
        const title = document.getElementById("group-title");
        const members = document.getElementById("group-members");
        const joinBtn = document.getElementById("join-group-btn");
        const closeBtn = document.getElementById("close-group");

        if (!popup || !title || !members || !joinBtn || !closeBtn) {
            console.warn(" Group status toast DOM missing");
            return;
        }

        title.textContent = `${data.title}`;
        members.textContent = `Status changed to: ${data.newStatus}`;
        joinBtn.style.display = "none"; // Hide join button if group is completed/expired

        popup.classList.add("show");

        const timer = setTimeout(() => {
            popup.classList.remove("show");
            joinBtn.style.display = "inline-block";
        }, 7000);

        closeBtn.onclick = () => {
            popup.classList.remove("show");
            joinBtn.style.display = "inline-block";
            clearTimeout(timer);
        };
    });

    const countdownIntervals = {};

    socket.on("sync-deadline", ({ dealId, timeLeft }) => {
        const countdownEl = document.getElementById(`countdown-${dealId}`);
        const cardEl = document.getElementById(`deal-card-${dealId}`);

        if (!countdownEl) return;

        const seconds = Math.floor(timeLeft / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        countdownEl.textContent = `⏳ ${mins}m ${secs < 10 ? "0" : ""}${secs}s left`;

        // Optional: Add pulsing effect when < 30s
        if (seconds < 30) {
            countdownEl.style.color = "#ff3d00";
            countdownEl.style.fontWeight = "bold";
        }
    });
    socket.on("deal_expired", ({ deal }) => {
        const cardEl = document.getElementById(`deal-card-${deal._id}`);
        const countdownEl = document.getElementById(`countdown-${deal._id}`);

        if (cardEl) {
            cardEl.style.opacity = "0.5";
            cardEl.style.pointerEvents = "none";
        }

        if (countdownEl) {
            countdownEl.textContent = " Deal Expired";
            countdownEl.style.color = "#888";
        }

        console.log("Deal expired:", deal.title);
    });


    //  DISCONNECT
    socket.on("disconnect", () => {
        console.log(" Disconnected from server");
    });
};
