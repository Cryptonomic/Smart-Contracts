const store = require("../store");
const convertJSON = require("./convertJSON");

module.exports = () => {
  if (store.keyStore == "") throw "Key Store Empty";
  return convertJSON(config.storage).replace(
    "${config.walletAddr}",
    store.keyStore.publicKeyHash
  );
};
