const Deal = require("../models/Deal");

exports.createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      original_price,
      deadline,
      location,
      max_participants,
      category,
      image_url,
    } = req.body;

    const newDeal = new Deal({
      title,
      description,
      price,
      original_price,
      deadline,
      location,
      max_participants,
      creator: req.user.user_id,
      participants: [req.user.user_id],
      category,
      image_url,
    });

    await newDeal.save();

    const io = req.app.get("io");

    if (io) {
      // 🔔 Emit new_deal
      io.emit("new_deal", {
        msg: "A new deal has been added",
        deal: newDeal,
      });

      //  Emit sync-deadline every second until it expires
      const deadlineTime = new Date(deadline).getTime();

      const timer = setInterval(async () => {
        const now = Date.now();
        const timeLeft = deadlineTime - now;

        if (timeLeft <= 0) {
          clearInterval(timer);

          // Optional: Mark deal as inactive if not already
          const freshDeal = await Deal.findById(newDeal._id);
          if (freshDeal && freshDeal.is_active) {
            freshDeal.is_active = false;
            await freshDeal.save();

            io.emit("deal_expired", {
              msg: "A deal has expired!",
              deal: {
                _id: freshDeal._id,
                title: freshDeal.title,
                image_url: freshDeal.image_url,
                deadline: freshDeal.deadline,
              },
            });
          }

          return;
        }

        io.emit("sync-deadline", {
          dealId: newDeal._id,
          timeLeft
        });
      }, 1000);
    }

    res.status(201).json({ msg: "Deal created successfully", deal: newDeal });
  } catch (error) {
    console.error("Error in createDeal:", error);
    res.status(500).json({ msg: "Server Error", error });
  }
};

// Get all deals
exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 }); // Latest first
    res.json({ msg: "Deals fetched successfully", deals });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};

// Manually expire all deals past their deadline

exports.expireDeals = async (req, res) => {
  try {
    const now = new Date();

    // Find deals that will be expired
    const dealsToExpire = await Deal.find({
      deadline: { $lt: now },
      is_active: true
    });

    if (dealsToExpire.length === 0) {
      return res.status(200).json({ msg: "No deals to expire", modifiedCount: 0 });
    }

    // Expire them
    await Deal.updateMany(
      { _id: { $in: dealsToExpire.map((d) => d._id) } },
      { is_active: false }
    );

    // Emit for each expired deal
    const io = req.app.get("io");
    if (io) {
      dealsToExpire.forEach((deal) => {
        io.emit("deal_expired", {
          msg: "A deal has expired!",
          deal: {
            _id: deal._id,
            title: deal.title,
            image_url: deal.image_url,
            deadline: deal.deadline,
          },
        });
      });
    }

    res.status(200).json({
      msg: "Expired deals updated successfully",
      modifiedCount: dealsToExpire.length
    });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};

// Get a single deal by ID
exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ msg: "Deal not found" });
    res.json({ msg: "Deal fetched successfully", deal });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};

// Update a deal by ID
exports.updateDeal = async (req, res) => {
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDeal) return res.status(404).json({ msg: "Deal not found" });
    res.json({ msg: "Deal updated", deal: updatedDeal });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};

// Soft delete a deal
exports.softDeleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ msg: "Deal not found" });

    deal.is_active = false;
    deal.deletedAt = new Date(); // Optional: audit field
    await deal.save();

    res.status(200).json({ msg: "Deal soft deleted successfully", deal });
  } catch (error) {
    console.error("Soft Delete Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get all active deals 
exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find().notDeleted().sort({ created_at: -1 });
    res.status(200).json(deals);
  } catch (error) {
    console.error("Get Deals Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};


