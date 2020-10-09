const conseiljs = require("conseiljs");
const config = require("../../globalConfig.json");
const convertJSON = require("./util/convertJSON");
const parseStorage = require("./util/parseStorage");
const store = require("./store");

module.exports = async () => {
  try {
    const fee = Number(
      (
        await conseiljs.TezosConseilClient.getFeeStatistics(
          config.tezos.conseilServer,
          config.tezos.network,
          conseiljs.OperationKindType.Origination
        )
      )[0]["high"]
    );
    console.log(fee);
    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
      config.tezos.tezosNode,
      store.signer,
      store.keyStore,
      0,
      undefined,
      fee,
      60000,
      100000,
      convertJSON(config.tezos.contract),
      parseStorage(),
      conseiljs.TezosParameterFormat.Micheline
    );
    const groupid = result["operationGroupID"]
      .replace(/"/g, "")
      .replace(/\n/, ""); // clean up RPC output
    console.log(
      `Injected operation group id ${groupid} ${result["operationGroupID"]}`
    );
    const conseilResult = await conseiljs.TezosConseilClient.awaitOperationConfirmation(
      config.tezos.conseilServer,
      config.tezos.network,
      groupid,
      2
    );
    console.log(`Originated contract at ${conseilResult.originated_contracts}`);
  } catch (err) {
    console.error(err);
  }
};

// Deploy();
