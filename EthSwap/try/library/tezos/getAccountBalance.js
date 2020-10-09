const { TezosNodeReader } = require("conseiljs");
const config = require("../../globalConfig.json");

module.exports = async (address) => {
  const result = await TezosNodeReader.getSpendableBalanceForAccount(
    config.tezos.RPC,
    address
  );
  return result;
};
