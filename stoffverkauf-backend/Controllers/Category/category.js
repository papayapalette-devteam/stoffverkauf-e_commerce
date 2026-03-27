const Category = require("../../Modals/AddCategory/category");
const { categoryValidationSchema } = require("../../Validation/category");



// CREATE + UPDATE
exports.saveCategory = async (req, res) => {
  try {
    // Remove fields not allowed in Joi schema
    const { id, createdAt, updatedAt, ...payload } = req.body;

    const { error, value } = categoryValidationSchema.validate(payload, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((err) => err.message),
      });
    }

    let category;

    // UPDATE
    if (id) {
      category = await Category.findByIdAndUpdate(
        id,
        value,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    }

    // CREATE
    category = new Category(value);
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category created successfully",
      category,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET with pagination + filter
exports.getCategories = async (req, res) => {
  try {

    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const total = await Category.countDocuments(filter);

    const data = await Category.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      categories: data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// DELETE
exports.deleteCategory = async (req, res) => {
  try {

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET ONE
exports.getCategoryById = async (req, res) => {
  try {

    const data = await Category.findById(req.params.id);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.toggleEnable = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.enabled = !category.enabled;
    await category.save();

    res.status(200).json({ message: "Category updated", enabled: category.enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};