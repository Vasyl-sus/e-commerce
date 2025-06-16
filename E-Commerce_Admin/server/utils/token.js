const jwt = require('jsonwebtoken');
const logger = require('./logger');
const config = require('../config/environment/index');
const lodash = require('lodash');

class TokenService {
  constructor(secretConfig) {
    this.adminSecret = secretConfig.adminSecret;
  }

  /**
   * CREATE TOKEN (DEMANDER, COMPANY, DEMANDER_RESET_PASSWORD)
   * @return token
   */
  createToken(tokenType, payloadData) {
    let secret;
    switch (tokenType) {
      case "admin":
        secret = this.adminSecret;
        break;
      default:
        secret = this.adminSecret;
        break;
    }

    try {
      const signature = jwt.sign(payloadData, secret, { algorithm: "HS256", issuer: "E-commerce" });
      return signature;
    } catch (err) {
      logger.error(err.toString());
      return false;
    }
  }

  /**
   * VALIDATES AND DECODES TOKEN
   * @return decodedToken
   */
  validateAndDecodeToken(tokenType, token) {
    let secret;

    switch (tokenType) {
      case "admin":
        secret = this.adminSecret;
        break;
      default:
        secret = this.adminSecret;
    }

    try {
      const decoded = jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "E-commerce" });
      return decoded;
    } catch (err) {
      logger.error(err);
      return null;
    }
  }
}

module.exports = new TokenService(config.token);