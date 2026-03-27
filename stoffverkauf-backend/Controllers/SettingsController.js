const Settings = require("../Modals/Settings/settings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: "global" });
    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({ id: "global" });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { id: "global" },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
