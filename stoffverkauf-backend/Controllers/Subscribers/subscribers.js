
const Subscriber = require("../../Modals/Subscribers/subscribers");


exports.Subscribers=async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already subscribed" });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

