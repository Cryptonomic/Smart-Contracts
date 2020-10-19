const {
  ConseilDataClient,
  ConseilOperator,
  ConseilSortDirection,
  TezosLanguageUtil,
  TezosMessageUtils,
} = require("conseiljs");
const { JSONPath } = require("jsonpath-plus");
const config = require("../../globalConfig.json");

const parseValue = (michelsonData) => {
  const michelineData = TezosLanguageUtil.translateMichelsonToMicheline(
    michelsonData
  );
  const jsonData = JSON.parse(michelineData);

  return {
    hashedSecret:
      "0x" +
      JSONPath({
        path: "$.args[0].args[0].bytes",
        json: jsonData,
      })[0],
    initiator: TezosMessageUtils.readAddress(
      JSONPath({ path: "$.args[0].args[1].args[0].bytes", json: jsonData })[0]
    ),
    initiator_eth: JSONPath({
      path: "$.args[0].args[1].args[1].string",
      json: jsonData,
    })[0],
    participant: TezosMessageUtils.readAddress(
      JSONPath({ path: "$.args[1].args[0].args[0].bytes", json: jsonData })[0]
    ),
    refundTimestamp: Number(
      JSONPath({ path: "$.args[1].args[0].args[1].int", json: jsonData })[0]
    ),
    state: Number(
      JSONPath({ path: "$.args[1].args[1].args[0].int", json: jsonData })[0]
    ),
    value: Number(
      JSONPath({ path: "$.args[1].args[1].args[1].int", json: jsonData })[0]
    ),
  };
};

module.exports = async () => {
  const data = await ConseilDataClient.executeEntityQuery(
    config.tezos.conseilServer,
    "tezos",
    config.tezos.network,
    "big_map_contents",
    {
      fields: ["key", "key_hash", "operation_group_id", "big_map_id", "value"],
      predicates: [
        {
          field: "big_map_id",
          operation: ConseilOperator.EQ,
          set: ["15534"],
          inverse: false,
        },
        {
          field: "value",
          operation: ConseilOperator.ISNULL,
          set: [""],
          inverse: true,
        },
      ],
      orderBy: [{ field: "key", direction: ConseilSortDirection.DESC }],
      aggregation: [],
      limit: 1000,
    }
  );
  let swaps = [];
  data.forEach((e) => {
    if (e.value !== null) swaps.push(parseValue(e.value));
  });
  return swaps;
};

// getSwaps().then(console.log);
