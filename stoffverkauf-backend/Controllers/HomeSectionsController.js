const HomeSection = require("../Modals/HomeSections/homeSection");

exports.getHomeSections = async (req, res) => {
  try {
    const sections = await HomeSection.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateHomeSection = async (req, res) => {
  try {
    const section = await HomeSection.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.upsertHomeSections = async (req, res) => {
    try {
        const sections = req.body;
        const results = await Promise.all(
            sections.map(async (s) => {
                return await HomeSection.findOneAndUpdate({ id: s.id }, s, { new: true, upsert: true });
            })
        );
        res.json(results);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
