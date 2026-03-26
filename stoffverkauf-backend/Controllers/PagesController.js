const Page = require("../Modals/Pages/page");

exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPageById = async (req, res) => {
  try {
    const page = await Page.findOne({ id: req.params.id });
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, upsert: true });
    res.json(page);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePage = async (req, res) => {
    try {
        await Page.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Page deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
