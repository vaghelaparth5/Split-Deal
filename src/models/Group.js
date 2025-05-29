const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  dealId: {type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true}, 
  dealLogo: { type: String, required: true },
  dealTitle: { type: String, required: true },
  dealDescription: { type: String },
  storeName: {type: String},
  storeLocation: { type: String, required: true },
  totalValue: { type: Number, required: true },
  discount: { type: Number, required: true },
  expiryDate: { type: Date, required: true }, 
  membersRequired: { type: Number, required: true }, 
  creationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive", "completed"], default: "active" }, 
  receiptImage: { type: String },
  whatapp_link:{type:String, default:""}
}, { timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);