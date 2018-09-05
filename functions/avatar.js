const axios = require("axios");


module.exports = class AvatarAPI {
  constructor(url, clientId, clientSecret) {
    this.baseUrl = url;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }
  async getToken(code) {
    const response = await axios({
      method: "post",
      url: `${this.baseUrl}/oauth/token`,
      data: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: "authorization_code"
      }
    });
    return response.data.access_token;
  }
  async getProfile(token) {
    const response = await axios({
      method: "get",
      url: `${this.baseUrl}/oauth/profile`,
      headers: { Authorization: "Bearer " + token }
    });
    return response.data;
  }
  async generate(token, text) {
    console.log(`${this.baseUrl}/api/v0/generate`);
    await axios({
      method: "post",
      url: `${this.baseUrl}/api/v0/generate`,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      data: {
        text: text
      }
    });
  }
  async getGenerated(token) {
    const response = await axios({
      method: "get",
      url: `${this.baseUrl}/api/v0/generated`,
      headers: { Authorization: "Bearer " + token }
    });
    return response.data.results;
  }
};
