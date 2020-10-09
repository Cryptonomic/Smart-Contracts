const { TezosNodeReader, TezosMessageUtils } = require("conseiljs");
const config = require("../../config/tez-config.json");
const init = require("../../tezos/init");
const { JSONPath } = require("jsonpath-plus");

const getSwap = async (secretHash) => {
  await init();
  secretHash = secretHash.substring(2);
  const packedKey = TezosMessageUtils.encodeBigMapKey(
    Buffer.from(TezosMessageUtils.writePackedData(secretHash, "bytes"), "hex")
  );
  const jsonData = await TezosNodeReader.getValueForBigMapKey(
    config.RPC,
    15534,
    packedKey,
    undefined,
    config.chain_id
  );
  console.log(jsonData);
  return {
    hashedSecret:
      "0x" +
      JSONPath({
        path: "$.args[0].args[0].bytes",
        json: jsonData,
      })[0],
    initiator: JSONPath({
      path: "$.args[0].args[1].args[0].string",
      json: jsonData,
    })[0],
    initiator_eth: JSONPath({
      path: "$.args[0].args[1].args[1].string",
      json: jsonData,
    })[0],
    participant: JSONPath({
      path: "$.args[1].args[0].args[0].string",
      json: jsonData,
    })[0],
    refundTimestamp: Number(
      Math.round(
        new Date(
          JSONPath({
            path: "$.args[1].args[0].args[1].string",
            json: jsonData,
          })[0]
        ).getTime() / 1000
      )
    ),
    state: Number(
      JSONPath({ path: "$.args[1].args[1].args[0].int", json: jsonData })[0]
    ),
    value: Number(
      JSONPath({ path: "$.args[1].args[1].args[1].int", json: jsonData })[0]
    ),
  };
};
getSwap(
  "0xb347704771c6167a822a67e238c88fa2a569c04707c84000f75889b5f06f34b6"
).then(console.log);
