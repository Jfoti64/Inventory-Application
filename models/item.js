const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
  description: { type: String, required: true, minLength: 1 },
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  price: { type: Number, required: true, min: 0 },
  num_in_stock: { type: Number, required: true, min: 0 },
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function () {
  return `/catalog/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Item", ItemSchema);
