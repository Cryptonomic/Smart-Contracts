const {
  ConseilDataClient,
  ConseilOperator,
  ConseilSortDirection,
  TezosLanguageUtil,
  TezosMessageUtils,
} = require("conseiljs");
const { JSONPath } = require("jsonpath-plus");
const init = require("../init");

const network = "carthagenet";

const conseilServer = {
  url: "https://conseil-dev.cryptonomic-infra.tech:443",
  apiKey: "1e2ca8b9-fb0b-4d78-ab8c-d5b67cc40434",
  network,
};
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

const getSwaps = async () => {
  await init();
  const data = await ConseilDataClient.executeEntityQuery(
    conseilServer,
    "tezos",
    network,
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
  console.log(data);
  let swaps = [];
  data.forEach((e) => {
    if (e.value !== null) swaps.push(parseValue(e.value));
  });
  return swaps;
};

getSwaps().then(console.log);
