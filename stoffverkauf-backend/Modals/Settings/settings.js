const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: "global" },
  general: {
    storeName: { type: String, default: "Stoffverkauf Weber" },
    email: { type: String, default: "info@stoffverkauf-weber.de" },
    phone: { type: String, default: "06171/53159" },
    currency: { type: String, default: "EUR (€)" },
    language: { type: String, default: "de" },
    address: { type: String, default: "Musterstraße 1, 61440 Oberursel" },
    vatNumber: { type: String, default: "DE123456789" },
  },
  tax: {
    standardRate: { type: Number, default: 19 },
    reducedRate: { type: Number, default: 7 },
    showIncVat: { type: Boolean, default: true },
    showVatNotice: { type: Boolean, default: true },
    taxNumber: { type: String, default: "DE123456789" },
    taxOffice: { type: String, default: "Finanzamt Bad Homburg" },
  },
  appearance: {
    primaryColor: { type: String, default: "#3E005E" },
    accentColor: { type: String, default: "#5600B2" },
    displayFont: { type: String, default: "Playfair Display" },
    bodyFont: { type: String, default: "DM Sans" },
    darkMode: { type: Boolean, default: false },
  },
  email: {
    orderConfirmations: { type: Boolean, default: true },
    shippingNotifications: { type: Boolean, default: true },
    reviewRequests: { type: Boolean, default: false },
    newsletterWelcome: { type: Boolean, default: true },
    abandonedCartReminder: { type: Boolean, default: false },
    senderEmail: { type: String, default: "noreply@stoffverkauf-weber.de" },
    abandonedCartDelay: { type: Number, default: 2 },
  },
  security: {
    forceSsl: { type: Boolean, default: true },
    showCookieBanner: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
