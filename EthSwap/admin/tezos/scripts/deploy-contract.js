const conseiljs = require("conseiljs");
const config = require("../../config/tez-config.json");
const convertJSON = require("../util/convertJSON");
const parseStorage = require("../util/parseStorage");
const init = require("../init");
const store = require("../store");

const Deploy = async () => {
  try {
    await init();
    const fee = Number(
      (
        await conseiljs.TezosConseilClient.getFeeStatistics(
          config.conseilServer,
          config.network,
          conseiljs.OperationKindType.Origination
        )
      )[0]["high"]
    );
    console.log(fee);
    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(
      config.tezosNode,
      store.signer,
      store.keyStore,
      0,
      undefined,
      fee,
      60000,
      100000,
      convertJSON(config.contract),
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
      config.conseilServer,
      config.network,
      groupid,
      2
    );
    console.log(`Originated contract at ${conseilResult.originated_contracts}`);
  } catch (err) {
    console.error(err);
  }
};

Deploy();
