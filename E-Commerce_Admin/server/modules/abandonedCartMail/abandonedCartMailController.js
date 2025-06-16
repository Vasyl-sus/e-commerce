const logger = require('../../utils/logger');
const uuid = require('uuid');
const bluebird = require('bluebird');
const Upload = require('../../utils/awsUpload');

const Ajv = require('ajv');
const validationSchema = require('../validationSchemas.js');

const acMail = require('./abandonedCartMailModel');

class acMailController {
  async addNewACmail(req, res) {
    try {
      const acMailData = req.body;
      let profile_img_idx = -1;
      const promises = [];

      let k = 0;
      for (const f in req.files) {
        const promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'acMail');
        promises.push(promise);
        if (f === "profile_image") profile_img_idx = k;
        k++;
      }

      const uploaded_files = await Promise.all(promises);

      if (acMailData.time) {
        acMailData.time = parseFloat(acMailData.time);
      }

      const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      const validate = ajv.compile(validationSchema.abandonedCartMailSchema1);
      const valid = validate(acMailData);
      if (!valid) {
        res.status(400).json({ success: false, message: validate.errors });
        return;
      }

      for (let i = 0; i < uploaded_files.length; i++) {
        if (i === profile_img_idx) {
          uploaded_files[i].profile_img = 1;
          acMailData.img_link = uploaded_files[i].link;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }

      try {
        const result = await acMail.createACmail(acMailData);
        logger.info('acMail created');
        res.status(200).json({ success: true, id: result });
      } catch (err) {
        logger.error("acMailController: addNewACmail - ERROR: acMail.createACmail: " + err.message);
        res.status(500).json({ success: false, message: err.message });
      }
    } catch (err) {
      logger.error("acMailController: addNewACmail - ERROR: try-catch: " + err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateACmail(req, res) {
    try {
      const { id } = req.params;
      const acMailData = req.body;
      let profile_img_idx = -1;
      const promises = [];

      const mail = await acMail.getACmailDetails(id);
      if (!mail) {
        res.status(404).json({ success: false, message: "Invalid acMail_id" });
        return;
      }

      let k = 0;
      for (const f in req.files) {
        const promise = Upload.uploadToS3Async(req.files[f].data, req.files[f].mimetype, 'acMail');
        promises.push(promise);
        if (f === "profile_image") profile_img_idx = k;
        k++;
      }

      const uploaded_files = await Promise.all(promises);

      if (acMailData.time) {
        acMailData.time = parseFloat(acMailData.time);
      }

      const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
      const validate = ajv.compile(validationSchema.abandonedCartMailSchema2);
      const valid = validate(acMailData);
      if (!valid) {
        res.status(400).json({ success: false, message: validate.errors });
        return;
      }

      for (let i = 0; i < uploaded_files.length; i++) {
        if (i === profile_img_idx) {
          uploaded_files[i].profile_img = 1;
          acMailData.img_link = uploaded_files[i].link;
        } else {
          uploaded_files[i].profile_img = 0;
        }
      }

      try {
        await acMail.updateACmail(id, acMailData);
        logger.info('acMail updated');
        res.status(200).json({ success: true });
      } catch (err) {
        logger.error("acMailController: updateACmail - ERROR: acMail.updateACmail: " + err.message);
        res.status(500).json({ success: false, message: err.message });
      }
    } catch (err) {
      logger.error("acMailController: updateACmail - ERROR: try-catch: " + err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async filterACmails(req, res) {
    try {
      const queryParams = {
        country: req.query.country,
        lang: req.query.lang,
        search: req.query.search,
        pageNumber: (req.query.pageNumber && parseInt(req.query.pageNumber)) || 1,
        pageLimit: (req.query.pageLimit && parseInt(req.query.pageLimit)) || 20
      };

      const [acMails, acMailsCount] = await Promise.all([
        acMail.filterACmails(queryParams),
        acMail.countFilterACmails(queryParams)
      ]);

      res.status(200).json({ success: true, acMails, acMailsCount });
    } catch (err) {
      logger.error("acMailController: filterACmails - ERROR: try-catch: " + err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteACmail(req, res) {
    try {
      const { id } = req.params;

      const mail = await acMail.getACmailDetails(id);
      if (!mail) {
        res.status(404).json({ success: false, message: "Invalid acMail_id" });
        return;
      }

      try {
        await acMail.deleteACmail(id);
        logger.info('acMail deleted');
        res.status(200).json({ success: true });
      } catch (err) {
        logger.error("acMailController: deleteACmail - ERROR: acMail.deleteACmail: " + err.message);
        res.status(500).json({ success: false, message: err.message });
      }
    } catch (err) {
      logger.error("acMailController: deleteACmail - ERROR: try-catch: " + err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new acMailController();