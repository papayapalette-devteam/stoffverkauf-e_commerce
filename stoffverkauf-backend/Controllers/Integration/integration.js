const Integration = require('../../Modals/Integration/integration');

// Save/Update Integration
exports.saveIntegration = async (req, res) => {
  try {
    const { key, name, data, isActive } = req.body;

    const integration = await Integration.findOneAndUpdate(
      { key },
      { key, name, data, isActive },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${name} integration saved successfully`,
      integration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Single Integration
exports.getIntegration = async (req, res) => {
  try {
    const { key } = req.params;
    const integration = await Integration.findOne({ key });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Integration not found"
      });
    }

    res.status(200).json({
      success: true,
      integration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Integrations
exports.getAllIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find();

    res.status(200).json({
      success: true,
      integrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Integration
exports.deleteIntegration = async (req, res) => {
  try {
    const { key } = req.params;
    const integration = await Integration.findOneAndDelete({ key });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Integration not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Integration deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
