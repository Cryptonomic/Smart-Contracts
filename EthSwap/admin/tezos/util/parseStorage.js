const config = require("../../config/tez-config.json");
const convertJSON = require("./convertJSON");

module.exports = () => {
  return convertJSON(config.storage).replace(
    "${config.walletAddr}",
    config.walletAddr
  );
};
