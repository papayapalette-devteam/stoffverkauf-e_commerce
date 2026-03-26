const Coupon = require("../../Modals/Marketing/coupon");
const { couponValidationSchema } = require("../../Validation/coupon");

// CREATE + UPDATE
exports.saveCoupon = async (req, res) => {
  try {
    const { _id, createdAt, updatedAt, ...payload } = req.body;

    const { error, value } = couponValidationSchema.validate(payload, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => err.message),
      });
    }

    let coupon;

    // UPDATE
    if (_id) {
      coupon = await Coupon.findByIdAndUpdate(
        _id,
        value,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        coupon,
      });
    }

    // CREATE
    // Check if coupon with code already exists
    const existing = await Coupon.findOne({ code: value.code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    coupon = new Coupon(value);
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL (with pagination)
exports.getCoupons = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Coupon.countDocuments();
    const totalActive = await Coupon.countDocuments({ active: true });
    const data = await Coupon.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data,
      pagination: {
        total,
        totalActive,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE STATUS
exports.toggleEnable = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.active = !coupon.active;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon status updated",
      active: coupon.active,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
