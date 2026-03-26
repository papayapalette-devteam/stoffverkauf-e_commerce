const Subscriber = require("../../Modals/Subscribers/subscribers");
const nodemailer = require("nodemailer");

// Add subscriber
exports.Subscribers = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(400).json({ success: false, error: "Email already subscribed" });

    const subscriber = new Subscriber({ email });
    await subscriber.save();
    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get subscribers with pagination
exports.getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const subscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscriber.countDocuments();

    res.json({
      subscribers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSubscribers: total,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", message: err.message });
  }
};

// Send Campaign
exports.sendCampaign = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, error: "Subject and message are required" });
    }

    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) {
      return res.status(400).json({ success: false, message: "No subscribers found" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bharatproperties570@gmail.com',
        pass: 'thpf pvbb pwfn idvf'
      }
    });

    const emails = subscribers.map(s => s.email);

    const mailOptions = {
        from: '"Stoffverkauf Weber Newsletter" <bharatproperties570@gmail.com>',
        to: emails, // Sending to all at once (or better, loop)
        subject: subject,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #5C00B3;">Stoffverkauf Weber</h1>
                <p>Hello,</p>
                <div style="margin: 20px 0; line-height: 1.6;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #888;">You are receiving this because you subscribed to our newsletter.</p>
               </div>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `Campaign sent successfully to ${emails.length} subscribers` });
  } catch (err) {
    console.error("Mail send error:", err);
    res.status(500).json({ success: false, error: "Failed to send campaign", message: err.message });
  }
};
