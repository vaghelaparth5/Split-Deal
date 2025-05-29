const mongoose = require("mongoose");

const DealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  original_price: { type: Number, required: true },
  deadline: { type: Date, required: true },
  location: { type: String, default: "" },
  max_participants: { type: Number, required: true },
  current_participants: { type: Number, default: 1 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  is_active: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }, // <-- Soft delete audit field
  created_at: { type: Date, default: Date.now },
  category: { type: String, default: "" },
  image_url: { type: String, default: "" },
  average_rating: { type: Number, default: 0 },
  number_of_ratings: { type: Number, default: 0 },
  whatapp_link: { type: String, default: "" }
});

// Optional: Query helper to filter only non-deleted deals
DealSchema.query.notDeleted = function () {
  return this.where({ is_active: true });
};

module.exports = mongoose.model("Deal", DealSchema);
