const conseiljs = require("conseiljs");
const log = require("loglevel");
const conSign = require("conseiljs-softsigner");
const fetch = require("node-fetch");
const store = require("./store");

module.exports = async (walletPK) => {
  const logger = log.getLogger("conseiljs");
  logger.setLevel("error", false);
  store.keyStore = await conSign.KeyStoreUtils.restoreIdentityFromSecretKey(
    walletPK
  );
  store.signer = await conSign.SoftSigner.createSigner(
    conseiljs.TezosMessageUtils.writeKeyWithHint(
      store.keyStore.secretKey,
      "edsk"
    ),
    -1
  );
  // console.log(store.keyStore);
  conseiljs.registerFetch(fetch);
  conseiljs.registerLogger(logger);
};
