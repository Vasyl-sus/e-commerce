const jwt = require('jsonwebtoken');
const config = require('../config/environment/index');

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
    let signature;
    try {
      signature = jwt.sign(payloadData, secret, {
        algorithm: "HS256",
        issuer: "E-Commerce"
      });
    } catch (err) {
      //logger.err(err.toString());
      return false;
    }
    return signature;
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

    let decoded = null;
    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
        issuer: "E-Commerce"
      });
    } catch (err) {
      //logger.error(err);
    }

    return decoded;
  }
}

module.exports = new TokenService(config.token);