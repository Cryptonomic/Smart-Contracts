import { TezosNodeReader, TezosMessageUtils } from "conseiljs";
import config from "../../../globalConfig.json";
import { JSONPath } from "jsonpath-plus";

const getSwap = async (secretHash) => {
  secretHash = secretHash.substring(2);
  const packedKey = TezosMessageUtils.encodeBigMapKey(
    Buffer.from(TezosMessageUtils.writePackedData(secretHash, "bytes"), "hex")
  );
  const jsonData = await TezosNodeReader.getValueForBigMapKey(
    config.tezos.RPC,
    15534,
    packedKey
  );
  if (jsonData === undefined) return jsonData;
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

export default getSwap;
