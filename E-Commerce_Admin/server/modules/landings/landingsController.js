var logger = require('../../utils/logger');
const fs = require('graceful-fs').promises;
const path = require('path');
var Ajv = require('ajv');
var validationSchema = require('../validationSchemas.js');

var landingsController = function () {};

landingsController.prototype.createLanding = async (req, res) => {
  try {
    var landingData = req.body;
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var validate = ajv.compile(validationSchema.landingSchema);
    var valid = validate(landingData);
    if (!valid) {
      res.status(400).json({ success: false, message: validate.errors });
      return;
    } else {
      try {
        await fs.writeFile(path.join(__dirname, '/../../../public/landings/' + landingData.filename + '.html'), landingData.html);
        await fs.writeFile(path.join(__dirname, '/../../../public/landings/' + landingData.filename + '.css'), landingData.css);
        res.status(200).json({ success: true });
      } catch (err) {
        logger.error("landingsController: createLanding - ERROR: fs.writeFile: " + err.message);
        res.status(500).json({ success: false, message: err.message });
      }
    }
  } catch (err) {
    logger.error("landingsController: createLanding - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = new landingsController();