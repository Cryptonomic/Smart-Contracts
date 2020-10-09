const conseiljs = require("conseiljs");
const config = require("../../config/tez-config.json");
const store = require("../store");

module.exports = (
  amtInMuTez,
  entry_point,
  parameters,
  extraGas = 300,
  extraStorage = 50
) => {
  return new Promise((resolve, reject) => {
    const fee = 105000,
      storage_limit = 6000,
      gas_limit = 1000000;
    conseiljs.TezosNodeWriter.testContractInvocationOperation(
      config.RPC,
      config.chain_id,
      store.keyStore,
      config.contractAddr,
      amtInMuTez,
      fee,
      storage_limit,
      gas_limit,
      entry_point,
      parameters,
      conseiljs.TezosParameterFormat.Michelson
    )
      .then(({ gas, storageCost: freight }) => {
        console.log(gas + extraGas, freight, ~~((gas + extraGas) / 10 + 300));
        return conseiljs.TezosNodeWriter.sendContractInvocationOperation(
          config.RPC,
          store.signer,
          store.keyStore,
          config.contractAddr,
          amtInMuTez,
          200000,
          freight + extraStorage,
          gas + extraGas,
          entry_point,
          parameters,
          conseiljs.TezosParameterFormat.Michelson
        );
      })
      .then((result) => {
        const groupid = result["operationGroupID"]
          .replace(/"/g, "")
          .replace(/\n/, ""); // clean up RPC output
        return conseiljs.TezosConseilClient.awaitOperationConfirmation(
          config.conseilServer,
          config.network,
          groupid,
          2
        );
      })
      .then(resolve)
      .catch(reject);
  });
};
