const mongoose = require("mongoose");
const { ROLE_ADMIN, ROLE_CUSTOMER, ROLE_LEGACY_USER, ROLE_OWNER } = require("../utils/roles");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [ROLE_CUSTOMER, ROLE_OWNER, ROLE_ADMIN, ROLE_LEGACY_USER],
      default: ROLE_CUSTOMER
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
